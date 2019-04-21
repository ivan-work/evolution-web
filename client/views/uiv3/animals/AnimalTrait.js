import React, {Fragment} from 'react';
import T from "i18n-react";
import cn from "classnames";
import {compose, withStateHandlers} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import GameStyles from "../GameStyles";
import Typography from "@material-ui/core/Typography/Typography";
import {AnimalLinkedTrait} from "../../game/animals/AnimalLinkedTrait";
import {ClickAnimalTrait, DragAnimalTrait} from "../../game/animals/AnimalTrait";
import {TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";
import {InteractionSource} from "../InteractionManager";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {PHASE} from "../../../../shared/models/game/GameModel";
import * as tt from "../../../../shared/models/game/evolution/traitTypes";
import {traitActivateRequest} from "../../../../shared/actions/trait";
import {openQuestionMetamorphose} from "../../../actions/modal";

const styles = theme => ({
  trait: {
    ...GameStyles.animalTrait
    // , display: 'inline-block'
    // , float: 'left'
    , ...GameStyles.addTraitColors((colorConfig) => ({
      background: colorConfig.fill
      , '& .AnimalTraitText': {
        color: colorConfig.text
        , fontSize: 14
        , display: 'flex'
        , '& .name': {
          ...GameStyles.ellipsis
          , flex: '1 1 0'
        }
      }
      , '&.canStart': {
        background: colorConfig.fillActive
        , cursor: 'pointer'
        , '& .AnimalTraitText': {
          color: colorConfig.textActive
          , fontWeight: 500
        }
        , '&:hover': {
          background: colorConfig.fillActiveHover
          , '& .AnimalTraitText': {
            color: colorConfig.textActiveHover
          }
        }
      }
      , '&.value': {
        background: colorConfig.fillValue
        , '& .AnimalTraitText': {
          color: colorConfig.textValue
          , fontWeight: 500
        }
      }
    }))
  }
});

export const TraitBase = withStyles(styles)(({classes, trait, canStart, startInteraction}) => (
  <div className={cn(
    'AnimalTrait2'
    , classes.trait
    , trait.type
    , {
      canStart
      , value: trait.value
    }
  )}
       onClick={startInteraction}>
    <Typography className='AnimalTraitText'>
      <span className='name'>{T.translate('Game.Trait.' + trait.type)}</span>
      <span className='food'>{trait.getDataModel().food > 0 ? ' +' + trait.getDataModel().food : null}</span>
    </Typography>
  </div>
));

export const AnimalTrait = (props) => {
  if (props.trait.type === tt.TraitMetamorphose) {
    return <InteractiveTraitMetamorphose {...props}/>;
  }
  if (props.trait.isLinked()) {
    // if (trait.getDataModel().playerControllable) {
    //   return <AnimalLinkedTrait trait={trait} sourceAnimal={animal}>
    //     <ClickAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}
    //                       onClick={() => this.props.onTraitDropped(animal, trait)}/>
    //   </AnimalLinkedTrait>
    // } else {
    //   return <AnimalLinkedTrait trait={trait} sourceAnimal={animal}>
    //     <AnimalTrait trait={trait}/>
    //   </AnimalLinkedTrait>
    // }
    return <TraitBase {...props}/>;
  } else if (props.trait.getDataModel().playerControllable && props.trait.getDataModel().targetType === TRAIT_TARGET_TYPE.ANIMAL) {
    return <InteractiveTrait {...props}/>;
  } else if (props.trait.getDataModel().playerControllable || props.trait.type === 'TraitAmbush') {
    return <InteractiveTrait {...props}/>;
  } else {
    return <TraitBase {...props}/>;
  }
};

const checkIfAmbushCanInteract = (game, sourceAnimal, trait) => {
  const traitCarnivorous = sourceAnimal.hasTrait(tt.TraitCarnivorous);
  return (
    trait.type === tt.TraitAmbush
    && game.status.phase === PHASE.AMBUSH
    && traitCarnivorous
    && !traitCarnivorous.checkActionFails(game, sourceAnimal)
  )
};

export const InteractiveTrait = compose(
  connect(({game}, {trait, sourceAnimal}) => {
    const canStart = (
      sourceAnimal.ownerId === game.userId
      && (
        (
          (game.isPlayerTurn() || trait.getDataModel().transient)
          && game.status.phase === PHASE.FEEDING
          && !trait.checkActionFails(game, sourceAnimal)
        )
        || checkIfAmbushCanInteract(game, sourceAnimal, trait)
      )
    );

    return {
      canStart
    }
  }, {
    traitActivateRequest
  })
  , withStateHandlers({questionMetamorphose: null}, {
    askQuestionMetamorphose: (state, props) => (trait, sourceAnimal) => ({
      questionMetamorphose: {trait, sourceAnimal}
    })
    , answerQuestionMetamorphose: (state, props) => () => ({
      questionMetamorphose: null
    })
  })
  , InteractionSource(DND_ITEM_TYPE.TRAIT, {
    canStart: ({canStart}) => canStart
    , onStart: ({trait, sourceAnimal, traitActivateRequest, askQuestionMetamorphose}) => {
      if (trait.getDataModel().targetType === TRAIT_TARGET_TYPE.ANIMAL) {
        return {trait, sourceAnimal}
      } else if (trait.type === tt.TraitMetamorphose) {
        askQuestionMetamorphose(trait, sourceAnimal);
      } else if (trait.type === tt.TraitRecombination) {
        traitActivateRequest(sourceAnimal.id, trait.id, sourceAnimal.id);
        return false;
      }
    }
  })
)(TraitBase);

const checkCanStart = ({game}, {trait, sourceAnimal}) => (
  sourceAnimal.ownerId === game.userId
  && (game.isPlayerTurn() || trait.getDataModel().transient)
  && game.status.phase === PHASE.FEEDING
  && !trait.checkActionFails(game, sourceAnimal)
);

export const InteractiveTraitMetamorphose = compose(
  connect((state, props) => ({canStart: checkCanStart(state, props)}), (dispatch, {trait, sourceAnimal}) => ({
    startInteraction: (e) => dispatch(openQuestionMetamorphose({trait, sourceAnimal}))
  }))
)(TraitBase);

export default AnimalTrait;