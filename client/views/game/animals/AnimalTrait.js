import React from 'react';
import T from "i18n-react";
import cn from "classnames";

import {compose, withHandlers} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import {InteractionSource} from "../InteractionManager";

import Typography from "@material-ui/core/Typography";

import GameStyles from "../GameStyles";

import {InteractionItemType} from "../InteractionItemType";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";
import * as tt from "../../../../shared/models/game/evolution/traitTypes";

import {openQuestionMetamorphose, openQuestionRecombination} from "../../../actions/modal";
import {traitActivateRequest, traitAmbushActivateRequest} from "../../../../shared/actions/trait";
import styled from "../../../styles/styled";
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import {TraitBase} from "../traits/Trait";
import LinkedTraitWrapper from "../traits/LinkedTraitWrapper";
import displayFood from "../food/displayFood";

export const AnimalTraitFoodDisplay = ({food}) => {
  if (food > 0) {
    return ` +${food}`
  } else if (food === 0) {
    return null
  } else {
    return ` ${food}`
  }
}

export const AnimalTraitBase = (props) => (
  <TraitBase
    {...props}
    textComponent={
      <>
        <span className='name'>
          {T.translate(`Game.Trait.${props.trait.type}`, {
            context: props.trait.linkSource ? 'source' : props.trait.value ? 'value' : void 0
          })}
        </span>
        <span className='food'>
          {displayFood(props.trait.getDataModel().food)}
        </span>
      </>
    }/>
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
  } else if (trait.type === tt.TraitIntellect) {
    return <InteractiveTraitIntellect {...props} />;
  } else if (traitDataModel.playerControllable
    && (
      traitDataModel.targetType === TRAIT_TARGET_TYPE.ANIMAL
      || traitDataModel.targetType === TRAIT_TARGET_TYPE.PLANT
    )) {
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

const checkCooldown = ({game}, {trait, sourceAnimal}) => (
  game.cooldowns.checkFor(trait.type, sourceAnimal.ownerId, sourceAnimal.id, trait.id)
);

export const InteractiveTraitMetamorphose = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(openQuestionMetamorphose({trait, sourceAnimal}))
  }))
)(AnimalTraitBase);

export const InteractiveTraitRecombination = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(openQuestionRecombination({trait, sourceAnimal}))
  }))
)(AnimalTraitBase);

export const InteractiveTraitAmbush = compose(
  connect((state, props) => ({
    canStart: checkCanStartAmbush(state, props)
    , value: state.game.getIn(['ambush', 'ambushers', props.sourceAnimal.id])
  }))
  , withHandlers({
    startInteraction: ({
                         dispatch,
                         sourceAnimal,
                         value
                       }) => () => dispatch(traitAmbushActivateRequest(sourceAnimal.id, !value))
  })
)(AnimalTraitBase);

export const InteractiveTraitIntellect = compose(
  connect((state, props) => ({
    isOnCooldown: checkCooldown(state, props)
  }))
)(AnimalTraitBase);

export const InteractiveTraitClickable = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: () => dispatch(traitActivateRequest(sourceAnimal.id, trait.id))
  }))
)(AnimalTraitBase);

export const InteractiveTrait = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
    , className: 'InteractiveTrait'
  }))
  , InteractionSource(InteractionItemType.TRAIT, {
    getIID: ({trait}) => trait.id
    , canStart: ({canStart}) => canStart
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