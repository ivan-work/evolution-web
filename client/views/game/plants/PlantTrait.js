import React from 'react';
import T from "i18n-react";
import cn from "classnames";

import {compose} from "recompose";
import {connect} from "react-redux";

import {InteractionSource} from "../InteractionManager";

import GameStyles from "../GameStyles";

import {InteractionItemType} from "../InteractionItemType";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";

import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import {TraitBase} from "../traits/Trait";
import LinkedTraitWrapper from "../traits/LinkedTraitWrapper";
import {getErrorOfEntityTraitActivation} from "../../../../shared/actions/trait.checks";
import * as ptt from "../../../../shared/models/game/evolution/plantarium/plantTraitTypes";
import {AnimalTraitBase} from "../animals/AnimalTrait";
import {plantTraitActivateRequest} from "../../../../shared/actions/game.plantarium";
import ERRORS from "../../../../shared/actions/errors";

export const PlantTraitBase = (props) => (
  <TraitBase
    {...props}
    textComponent={<span className='name'>{T.translate('Game.Trait.' + props.trait.type)}</span>}
  />
);

const PlantTrait = (props) => {
  const trait = props.trait;
  const traitDataModel = trait.getDataModel();
  if (trait.type === ptt.PlantTraitHiddenCarnivorous) {
    return <InteractivePlantTraitCarnivorous {...props} />;
  } else if (traitDataModel.playerControllable && traitDataModel.targetType === TRAIT_TARGET_TYPE.ANIMAL) {
    return <InteractiveTrait {...props} />;
  } else if (traitDataModel.playerControllable) {
    return <InteractiveTraitClickable {...props} />;
  } else {
    return <PlantTraitBase {...props} />;
  }
};


const checkCanStart = ({game}, {trait, sourcePlant}) => (
  (game.isPlayerTurn() || trait.getDataModel().transient)
  && game.status.phase === PHASE.FEEDING
  && !getErrorOfEntityTraitActivation(game, game.userId, sourcePlant, trait)
);

const checkCooldown = ({game}, {trait, sourcePlant}) => (
  game.cooldowns.checkFor(trait.type, game.userId, sourcePlant.id, trait.id)
);

export const InteractivePlantTraitCarnivorous = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }))
  , InteractionSource(InteractionItemType.PLANT_ATTACK, {
    getIID: ({trait}) => trait.id
    , canStart: ({canStart}) => canStart
    , onStart: ({trait, sourcePlant}) => ({trait, sourcePlant})
  })
)(AnimalTraitBase);

export const InteractiveTraitClickable = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }), (dispatch, {trait, sourcePlant}) => ({
    startInteraction: () => dispatch(plantTraitActivateRequest(sourcePlant.id, trait.id))
  }))
)(PlantTraitBase);

export const InteractiveTrait = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
    , isOnCooldown: checkCooldown(state, props)
  }))
  , InteractionSource(InteractionItemType.TRAIT, {
    getIID: ({trait}) => trait.id
    , canStart: ({canStart}) => canStart
    , onStart: ({trait, sourcePlant}) => ({trait, sourcePlant})
  })
)(PlantTraitBase);

const AnimatedTraitHOC = AnimatedHOC(({trait}) => `PlantTrait#${trait.id}`);

export const PlantTraitWrapper = (props) => (
  <LinkedTraitWrapper {...props}>
    <PlantTrait {...props} />
  </LinkedTraitWrapper>
);

export default AnimatedTraitHOC(PlantTraitWrapper);