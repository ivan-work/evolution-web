import React from 'react';
import T from "i18n-react";
import cn from "classnames";

import {compose, withHandlers} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import {InteractionSource} from "../InteractionManager";

import Typography from "@material-ui/core/Typography";

import GameStyles from "../GameStyles";

import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";
import * as tt from "../../../../shared/models/game/evolution/traitTypes";

import {openQuestionMetamorphose, openQuestionRecombination} from "../../../actions/modal";
import {traitActivateRequest, traitAmbushActivateRequest} from "../../../../shared/actions/trait";
import styled from "../../../styles/styled";
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import WhiteTooltip from "../../utils/WhiteTooltip";
import LinkedTrait from "../lineBetweenTraits/LinkedTrait";
import {TraitBase} from "../traits/Trait";
import LinkedTraitWrapper from "../lineBetweenTraits/LinkedTraitWrapper";

export const AnimalTraitBase = (props) => (
  <TraitBase
    {...props}
    textComponent={
      <>
        <span className='name'>{T.translate('Game.Trait.' + props.trait.type)}</span>
        <span className='food'>
          {props.trait.getDataModel().food > 0 ? ' +' + props.trait.getDataModel().food : null}
          </span>
      </>
    } />
);

const AnimalTrait = (props) => {
  const trait = props.trait;
  const traitDataModel = trait.getDataModel();
  if (trait.type === tt.TraitMetamorphose) {
    return <InteractiveTraitMetamorphose {...props} />;
  } else if (trait.type === tt.TraitRecombination) {
    return <InteractiveTraitRecombination {...props} />;
  } else if (trait.type === tt.TraitAmbush) {
    return <InteractiveTraitAmbush {...props} />;
  } else if (traitDataModel.playerControllable && traitDataModel.targetType === TRAIT_TARGET_TYPE.ANIMAL) {
    return <InteractiveTrait {...props} />;
  } else if (traitDataModel.playerControllable) {
    return <InteractiveTraitClickable {...props} />;
  } else {
    return <AnimalTraitBase {...props} />;
  }
};

const checkCanStartBase = (game, animal) => (game.userId === animal.ownerId);

const checkCanStart = ({game}, {trait, sourceAnimal}) => (
  checkCanStartBase(game, sourceAnimal)
  && (game.isPlayerTurn() || trait.getDataModel().transient)
  && game.status.phase === PHASE.FEEDING
  && !trait.getErrorOfUse(game, sourceAnimal)
);

const checkCanStartAmbush = ({game}, {trait, sourceAnimal}) => {
  const traitCarnivorous = sourceAnimal.hasTrait(tt.TraitCarnivorous);
  return (
    checkCanStartBase(game, sourceAnimal)
    && game.status.phase === PHASE.AMBUSH
    && traitCarnivorous
    && !traitCarnivorous.getErrorOfUse(game, sourceAnimal)
  )
};

export const InteractiveTraitMetamorphose = compose(
  connect((state, props) => ({canStart: checkCanStart(state, props)}), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(openQuestionMetamorphose({trait, sourceAnimal}))
  }))
)(AnimalTraitBase);

export const InteractiveTraitRecombination = compose(
  connect((state, props) => ({canStart: checkCanStart(state, props)}), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(openQuestionRecombination({trait, sourceAnimal}))
  }))
)(AnimalTraitBase);

export const InteractiveTraitAmbush = compose(
  connect((state, props) => ({
    canStart: checkCanStartAmbush(state, props)
    , value: state.game.getIn(['ambush', 'ambushers', props.sourceAnimal.id])
  }))
  , withHandlers({
    startInteraction: ({dispatch, sourceAnimal, value}) => () => dispatch(traitAmbushActivateRequest(sourceAnimal.id, !value))
  })
)(AnimalTraitBase);

export const InteractiveTraitClickable = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
  }), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(traitActivateRequest(sourceAnimal.id, trait.id))
  }))
)(AnimalTraitBase);

export const InteractiveTrait = compose(
  connect((state, props) => ({canStart: checkCanStart(state, props)}), {traitActivateRequest})
  , InteractionSource(DND_ITEM_TYPE.TRAIT, {
    canStart: ({canStart}) => canStart
    , onStart: ({trait, sourceAnimal}) => ({trait, sourceAnimal})
  })
)(AnimalTraitBase);

const AnimatedTraitHOC = AnimatedHOC(({trait}) => `AnimalTrait#${trait.id}`);

export const AnimalTraitWrapper = (props) => (
  <LinkedTraitWrapper {...props}>
    <AnimalTrait {...props} />
  </LinkedTraitWrapper>
);

export default AnimatedTraitHOC(AnimalTraitWrapper);