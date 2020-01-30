import React from 'react';
import T from "i18n-react";
import cn from "classnames";

import {compose} from "recompose";
import {connect} from "react-redux";

import {InteractionSource} from "../InteractionManager";

import GameStyles from "../GameStyles";

import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";

import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import {TraitBase} from "../traits/Trait";
import LinkedTraitWrapper from "../lineBetweenTraits/LinkedTraitWrapper";
import {plantTraitActivateRequest} from "../../../../shared/actions/game.plantarium";
import {getErrorOfEntityTraitActivation} from "../../../../shared/actions/trait.checks";

export const PlantTraitBase = (props) => (
  <TraitBase
    {...props}
    textComponent={<span className='name'>{T.translate('Game.Trait.' + props.trait.type)}</span>}
  />
);

const PlantTrait = (props) => {
  const trait = props.trait;
  const traitDataModel = trait.getDataModel();
  if (traitDataModel.playerControllable && traitDataModel.targetType === TRAIT_TARGET_TYPE.ANIMAL) {
    return <InteractiveTrait {...props} />;
  } else if (traitDataModel.playerControllable) {
    return <InteractiveTraitClickable {...props} />;
  } else {
    return <PlantTraitBase {...props} />;
  }
};


const checkCanStart = ({game}, {trait, host}) => (
  (game.isPlayerTurn() || trait.getDataModel().transient)
  && game.status.phase === PHASE.FEEDING
  && !getErrorOfEntityTraitActivation(game, game.getPlayer().id, host, trait)
);

export const InteractiveTraitClickable = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
  }), (dispatch, {trait, host}) => ({
    startInteraction: () => dispatch(plantTraitActivateRequest(host.id, trait.id))
  }))
)(PlantTraitBase);

export const InteractiveTrait = compose(
  connect((state, props) => ({
    canStart: checkCanStart(state, props)
  }), {plantTraitActivateRequest})
  , InteractionSource(DND_ITEM_TYPE.TRAIT, {
    canStart: ({canStart}) => canStart
    , onStart: ({trait, host}) => ({trait, host})
  })
)(PlantTraitBase);

const AnimatedTraitHOC = AnimatedHOC(({trait}) => `PlantTrait#${trait.id}`);

export const PlantTraitWrapper = (props) => (
  <LinkedTraitWrapper {...props}>
    <PlantTrait {...props} />
  </LinkedTraitWrapper>
);

export default AnimatedTraitHOC(PlantTraitWrapper);