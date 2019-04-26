import React, {Fragment} from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import T from "i18n-react";
import cn from "classnames";
import {compose, lifecycle, setDisplayName, setPropTypes} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';
import repeat from 'lodash/times';
import noop from 'lodash/noop';

import GameStyles from "../GameStyles";
import Typography from "@material-ui/core/Typography/Typography";

import geckoHR from '../../../assets/gfx/geckoHR.svg';
import {PHASE} from "../../../../shared/models/game/GameModel";
import {CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from "../../../../shared/models/game/evolution/constants";

import IconFull from '@material-ui/icons/SentimentVerySatisfied';
import IconEnough from '@material-ui/icons/SentimentSatisfied';
import IconHungry from '@material-ui/icons/SentimentVeryDissatisfied';

import IconFlagPoisoned from '@material-ui/icons/SmokingRooms';
import IconFlagHibernated from '@material-ui/icons/Snooze';
import IconFlagShell from '@material-ui/icons/Home';
import IconFlagRegeneration from '@material-ui/icons/GetApp';
import IconFlagShy from '@material-ui/icons/Report';
import Food from "../food/Food";
import AnimalTrait from "./AnimalTrait";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitTakeFoodRequest,
  traitTakeShellRequest
} from "../../../../shared/actions/trait";
import {InteractionTarget} from "../InteractionManager";
import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {gameDeployRegeneratedAnimalRequest, gameDeployTraitRequest} from "../../../../shared/actions/game";
import * as tt from "../../../../shared/models/game/evolution/traitTypes";
import {AnimalModel} from "../../../../shared/models/game/evolution/AnimalModel";
import {animationCompleted, animationSubscribe, animationUnsubscribe} from "../../../reducers/animations-rdx-client";

const styles = theme => ({
  animal: {
    ...GameStyles.animal
    , 'will-change': 'transform'
    , '& .AnimalIcon': {
      verticalAlign: 'middle'
    }
    , '& .AnimalIconText': {
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 0,
      verticalAlign: 'middle'
    }
    , '& .AnimalIconFood': {
      fontSize: 24
      , fill: 'orange'
    }
  }
  , animalToolbar: {
    textAlign: 'center'
    , height: 44
    , maxWidth: GameStyles.animal.minWidth
    , lineHeight: 0
  }
});

// region Animal Food
export const AnimalFoodStatus = ({animal}) => (
  animal.isFull() ? <IconFull className='AnimalIcon'/>
    : animal.canSurvive() ? <IconEnough className='AnimalIcon'/>
    : <IconHungry className='AnimalIcon'/>
);

const AnimalFood = () => (<Food className='AnimalIcon AnimalIconFood'/>);

export const ListAnimalFood = ({food}) => repeat(food, i => <AnimalFood key={i}/>);

export const NumberedAnimalFood = ({food}) => (
  <Fragment>
    <Typography inline className='AnimalIconText'>{food}</Typography>
    <AnimalFood/>
  </Fragment>
);

const AnimalFoodContainer = ({food}) => (food < 4
  ? <ListAnimalFood food={food}/>
  : <NumberedAnimalFood food={food}/>);
//endregion

const calcWidthF = x => Math.floor(x / 8) + 1;
const calcWidth = (e) => e.style.width = GameStyles.defaultWidth * calcWidthF(e.children.length) + 'px';

export class BaseAnimal extends React.PureComponent {
  fixAnimalWidth = () => this.animalRef && calcWidth(this.animalRef);

  setAnimalRef = (e) => {
    this.animalRef = e;
    this.fixAnimalWidth();
    if (this.props.animationRef) {
      this.props.animationRef.current = e;
    }
    console.log('REF SET');
  };

  componentDidUpdate() {
    this.fixAnimalWidth();
  }

  render() {
    const {classes, animal, game, children, canInteract, acceptInteraction} = this.props;

    const cnAnimal = cn(
      classes.animal
      , {canInteract}
    );

    const traitList = children || (animal.traits.toList()
      .reverse()
      .map(trait => <AnimalTrait key={trait.id}
                                 trait={trait}
                                 sourceAnimal={animal}/>));

    return (
      <div className={cnAnimal} ref={this.setAnimalRef} onClickCapture={acceptInteraction}>
        <div className={classes.animalToolbar}>
          <div>
            {/*{renderAnimalFood(animal)}*/}
            {game && game.status.phase === PHASE.FEEDING && <AnimalFoodStatus animal={animal}/>}
            {game && game.status.phase === PHASE.FEEDING && <AnimalFoodContainer food={animal.getFood()}/>}
          </div>
          <div>
            {animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) && <IconFlagPoisoned className='AnimalIcon'/>}
            {animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && <IconFlagHibernated className='AnimalIcon'/>}
            {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && <IconFlagShell className='AnimalIcon'/>}
            {animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION) && <IconFlagRegeneration className='AnimalIcon'/>}
            {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHY) && <IconFlagShy className='AnimalIcon'/>}
            {/*{<IconFlagPoisoned className='Flag Poisoned'/>}*/}
            {/*{<IconFlagHibernated className='Flag Hibernated'/>}*/}
            {/*{<IconFlagShell className='Flag Shell'/>}*/}
            {/*{<IconFlagRegeneration className='Flag Regeneration'/>}*/}
            {/*{<IconFlagShy className='Flag Shy'/>}*/}
          </div>
        </div>
        {traitList}
      </div>
    );
  }
}

export const Animal = compose(
  setDisplayName('Animal')
  , setPropTypes({animal: PropTypes.instanceOf(AnimalModel).isRequired})
  , withStyles(styles)
  , connect(({game}) => ({game}))
)(BaseAnimal);

export const Animated = (config) => {
  return compose(
    connect(({animations}, props) => {
      const animation = animations.current.find(animation => {
        return config.checkAnimation(animation, props) && !!config.animations[animation.type];
      });
      return ({
        animation
      })
    }, {animationSubscribe, animationUnsubscribe, animationCompleted})
    , lifecycle({
      componentDidMount() {
        this.subscription = animationSubscribe(Object.keys(config));
      }
      , componentWillUnmount() {
        animationUnsubscribe(this.subscription);
      }
      , componentDidUpdate({animation: prevAnimation}) {
        const {animation: currentAnimation, animationCompleted} = this.props;
        if (!!currentAnimation && currentAnimation !== prevAnimation) {
          const element = ReactDOM.findDOMNode(this);
          Promise.resolve(config.animations[currentAnimation.type](element))
            .then((data) => {
              console.log('resolved', data);
              animationCompleted(currentAnimation.id);
            });
        }
      }
    })
  )
};

export const InteractiveAnimal = compose(
  setDisplayName('InteractiveAnimal')
  , setPropTypes({animal: PropTypes.instanceOf(AnimalModel).isRequired})
  // , Animated({
  //   gameFoodTake_Start: {
  //     type: 'gameFoodTake_Start'
  //     , checkAction: (action) => {
  //       return animal.id === action.data.animalId
  //     }
  //     , animation: (element) => {
  //       return Velocity(element, {
  //         translateY: -GameStyles.animal.height
  //       }, 500)
  //     }
  //     , gameFoodTake_End: (element) => {
  //       return Velocity(element, {
  //         translateY: 0
  //       }, 250)
  //     }
  //   }
  // })
  // , Animated({
  //   checkAnimation: (animation, {animal}) => animation.data === animal.id
  //   , animations: {
  //     gameFoodTake_Start: (element) => {
  //       return Velocity(element, {
  //         translateY: -GameStyles.animal.height
  //       }, 500)
  //     }
  //     , gameFoodTake_End: (element) => {
  //       return Velocity(element, {
  //         translateY: 0
  //       }, 250)
  //     }
  //   }
  // })
  , connect(({game}, {animal}) => {
    return {
      game
      , isUserAnimal: game.userId === animal.ownerId
    }
  }, {
    // PHASE.DEPLOY
    gameDeployTraitRequest
    // PHASE.FEEDING
    , traitTakeFoodRequest
    , traitActivateRequest
    , traitAmbushActivateRequest
    , traitTakeShellRequest
    // PHASE.REGENERATION
    , gameDeployRegeneratedAnimalRequest
  })
  , InteractionTarget([DND_ITEM_TYPE.CARD_TRAIT, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.TRAIT_SHELL, DND_ITEM_TYPE.ANIMAL_LINK], {
    canInteract: ({game, isUserAnimal, animal}, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const {traitType} = item;
              const traitData = TraitModel.new(traitType).getDataModel();
              return !traitData.checkTraitPlacementFails(animal);
            case PHASE.REGENERATION:
              return animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION);
            default:
              return false;
          }
        }
        case DND_ITEM_TYPE.ANIMAL_LINK: {
          const {traitType, animalId, alternateTrait} = item;
          const sourceAnimal = game.locateAnimal(animalId);
          return (
            animal !== sourceAnimal
            && animal.ownerId === sourceAnimal.ownerId
            && !TraitModel.LinkBetweenCheck(traitType, sourceAnimal, animal)
          );
        }
        case DND_ITEM_TYPE.FOOD:
          return isUserAnimal && animal.canEat(game);
        case DND_ITEM_TYPE.TRAIT: {
          const {trait, sourceAnimal} = item;
          const targetCheck = !trait.getDataModel().checkTarget || trait.getDataModel().checkTarget(game, sourceAnimal, animal);
          return sourceAnimal.id !== animal.id && targetCheck;
        }
        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          return !trait.getDataModel().checkTraitPlacementFails(animal);
        }
        default:
          return true;
      }
    }
    , onInteract: ({
                     game
                     , animal
                     // PHASE.DEPLOY
                     , gameDeployTraitRequest
                     // PHASE.FEEDING
                     , traitTakeFoodRequest
                     , traitActivateRequest
                     , traitAmbushActivateRequest
                     , traitTakeShellRequest
                     // PHASE.REGENERATION
                     , gameDeployRegeneratedAnimalRequest
                     , ...props
                   }, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          const {cardId, traitType, alternateTrait} = item;
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const traitDataModel = TraitModel.new(traitType).getDataModel();
              if (traitDataModel.cardTargetType & CTT_PARAMETER.LINK) {
                return {
                  type: DND_ITEM_TYPE.ANIMAL_LINK
                  , data: {
                    ...item
                    , animalId: animal.id
                  }
                };
              } else {
                gameDeployTraitRequest(cardId, animal.id, alternateTrait);
              }
              break;
            case PHASE.REGENERATION:
              gameDeployRegeneratedAnimalRequest(cardId, animal.id);
              break;
          }
          break;
        }

        case DND_ITEM_TYPE.ANIMAL_LINK: {
          const {cardId, alternateTrait, animalId} = item;
          gameDeployTraitRequest(cardId, animalId, alternateTrait, animal.id);
          break;
        }

        case DND_ITEM_TYPE.FOOD: {
          traitTakeFoodRequest(animal.id);
          break;
        }

        case DND_ITEM_TYPE.TRAIT: {
          const {sourceAnimal, trait} = item;
          traitActivateRequest(sourceAnimal.id, trait.id, animal.id);
          break;
        }

        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          traitTakeShellRequest(animal.id, trait.id);
          break;
        }
      }
    }
  })
)(Animal);

export default InteractiveAnimal;