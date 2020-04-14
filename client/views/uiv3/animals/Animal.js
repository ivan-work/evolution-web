import React, {Fragment} from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import T from "i18n-react";
import cn from "classnames";

import {compose, setDisplayName, setPropTypes} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";

import repeat from 'lodash/times';


import GameStyles from "../GameStyles";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";

import geckoHR from '../../../assets/gfx/geckoHR.svg';
import {PHASE} from "../../../../shared/models/game/GameModel";
import {CTT_PARAMETER, TRAIT_ANIMAL_FLAG, TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";

import IconFull from '@material-ui/icons/SentimentVerySatisfied';
import IconEnough from '@material-ui/icons/SentimentSatisfied';
import IconHungry from '@material-ui/icons/SentimentVeryDissatisfied';

import Food from "../food/Food";
import AnimalTrait from "./AnimalTrait";

import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {InteractionTarget} from "../InteractionManager";

import {gameDeployRegeneratedAnimalRequest, gameDeployTraitRequest} from "../../../../shared/actions/game";
import {
  traitActivateRequest,
  traitAmbushActivateRequest,
  traitTakeCoverRequest,
  traitTakeFoodRequest,
  traitTakeShellRequest
} from "../../../../shared/actions/trait";

import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {AnimalModel} from "../../../../shared/models/game/evolution/AnimalModel";

import {AT_DEATH} from "../animations";
import {SVGContextSpy} from "../SVGContext";
import {
  getErrorOfAnimalEatingFromGame,
  getErrorOfAnimalEatingFromPlant,
  getErrorOfAnimalTakingCover
} from "../../../../shared/actions/trait.checks";
import AnimalFlags from "./AnimalFlags";
import {gamePlantAttackRequest} from "../../../../shared/actions/game.plantarium";

const DEATH_ANIMATION_TIME = `${AT_DEATH}ms`;

const styles = theme => ({
  animal: {
    ...GameStyles.animal
    , transition: 'background-color 1s'
    , 'will-change': 'transform'
    , '&.Animate_Death-leave': {
      backgroundColor: 'black'
      , maxWidth: 0
      , minWidth: 0
      , margin: 0
      , transform: 'scaleX(0)'
      // , transition: 'background-color ${DEATH_ANIMATION_TIME}, max-width ${DEATH_ANIMATION_TIME}, min-width ${DEATH_ANIMATION_TIME}, margin ${DEATH_ANIMATION_TIME}'
      , transition: `linear ${DEATH_ANIMATION_TIME}`
      , '& > div': {
        visibility: 'hidden'
      }
    }
    , '& .AnimalIcon': {
      verticalAlign: 'middle'
    }
    , '& .AnimalFlag': {
      fill: '#555'
      , '&.good': {
        fill: '#030'
      }
      , '&.bad': {
        fill: '#800'
      }
    }
    , '& .AnimalIconText': {
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 0,
      verticalAlign: 'middle'
    }
    , '& .AnimalIconFood': {
      fontSize: 24
      , stroke: 'none'
      , fill: '#F90'
    }
    , '&.velocity-animating': {
      zIndex: 2
    }
  }
  , animalToolbar: {
    textAlign: 'center'
    , height: GameStyles.animal.height - (GameStyles.animalTrait.height + 2) * 6
    , maxWidth: GameStyles.animal.minWidth
    , lineHeight: 0
  }
});

// region Animal Food
export const AnimalFoodStatus = ({animal}) => (
  animal.isFull() ? <IconFull className='AnimalIcon' />
    : animal.canSurvive() ? <IconEnough className='AnimalIcon' />
    : <IconHungry className='AnimalIcon' />
);

const AnimalFood = () => (<Food className='AnimalIcon AnimalIconFood' />);

export const ListAnimalFood = ({food}) => repeat(food, i => <AnimalFood key={i} />);

export const NumberedAnimalFood = ({food}) => (
  <Fragment>
    <Typography display='inline' className='AnimalIconText'>{food}</Typography>
    <AnimalFood />
  </Fragment>
);

const AnimalFoodContainer = ({food}) => (food < 4
  ? <ListAnimalFood food={food} />
  : <NumberedAnimalFood food={food} />);
//endregion

const calcWidthF = x => Math.floor(x / 8) + 1;
const calcWidth = (e) => e.style.width = GameStyles.defaultWidth * calcWidthF(e.children.length) + 'px';

export class BaseAnimal extends React.PureComponent {
  fixAnimalWidth = () => this.animalRef && calcWidth(this.animalRef);

  setAnimalRef = (e) => {
    this.animalRef = e;
    this.fixAnimalWidth();
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
                                 sourceAnimal={animal} />));

    return (
      <div className={cnAnimal} ref={this.setAnimalRef} onClickCapture={acceptInteraction}>
        <div className={classes.animalToolbar}>
          <div>
            {/*{renderAnimalFood(animal)}*/}
            {game && game.status.phase === PHASE.FEEDING && <AnimalFoodStatus animal={animal} />}
            {game && game.status.phase === PHASE.FEEDING && <AnimalFoodContainer food={animal.getFood()} />}
          </div>
          <div>
            <AnimalFlags animal={animal} />
          </div>
        </div>
        {traitList}
        {/*<SVGContextSpy name='Animal Spy' watch={animal.traits}/>*/}
      </div>
    );
  }
}

export const Animal = compose(
  setDisplayName('Animal')
  , setPropTypes({animal: PropTypes.instanceOf(AnimalModel).isRequired})
  , withStyles(styles)
)(BaseAnimal);

export const InteractiveAnimal = compose(
  setDisplayName('InteractiveAnimal')
  , setPropTypes({animal: PropTypes.instanceOf(AnimalModel).isRequired})
  , connect(({game}, {animal}) => {
    return {
      game
      , userId: game.userId
    }
  }, {
    // PHASE.DEPLOY
    gameDeployTraitRequest
    // PHASE.FEEDING
    , traitTakeFoodRequest
    , traitActivateRequest
    , traitAmbushActivateRequest
    , traitTakeShellRequest
    , traitTakeCoverRequest
    , gamePlantAttackRequest
    // PHASE.REGENERATION
    , gameDeployRegeneratedAnimalRequest
  })
  , InteractionTarget([
    DND_ITEM_TYPE.CARD_TRAIT
    , DND_ITEM_TYPE.FOOD
    , DND_ITEM_TYPE.TRAIT
    , DND_ITEM_TYPE.TRAIT_SHELL
    , DND_ITEM_TYPE.ANIMAL_LINK
    , DND_ITEM_TYPE.COVER
    , DND_ITEM_TYPE.PLANT_ATTACK
  ], {
    canInteract: ({game, userId, animal}, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const {traitType} = item;
              const traitData = TraitModel.new(traitType).getDataModel();
              if (!(traitData.cardTargetType & CTT_PARAMETER.ANIMAL)) {
                return false;
              }
              return (
                !traitData.getErrorOfTraitPlacement_User(userId, animal.ownerId)
                && !traitData.getErrorOfTraitPlacement(animal)
              );
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
        case DND_ITEM_TYPE.FOOD: {
          const {sourceId} = item;
          const sourcePlant = game.getPlant(sourceId);
          return (
            game.userId === animal.ownerId
            && (
              !sourcePlant && !getErrorOfAnimalEatingFromGame(game, animal)
              || !!sourcePlant && !getErrorOfAnimalEatingFromPlant(game, animal, sourcePlant)
            )
          );
        }
        case DND_ITEM_TYPE.TRAIT: {
          const {trait, sourceAnimal} = item;
          const traitDataModel = trait.getDataModel();
          if (traitDataModel.targetType !== TRAIT_TARGET_TYPE.ANIMAL) return;
          const targetError = traitDataModel.getErrorOfUseOnTarget(game, sourceAnimal, animal);
          return sourceAnimal.id !== animal.id && !targetError;
        }
        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          return (
            !trait.getDataModel().getErrorOfTraitPlacement_User(userId, animal.ownerId)
            && !trait.getDataModel().getErrorOfTraitPlacement(animal)
          );
        }
        case DND_ITEM_TYPE.COVER: {
          const {sourceId} = item;
          const sourcePlant = game.getPlant(sourceId);
          return game.userId === animal.ownerId
            && !getErrorOfAnimalTakingCover(game, animal, sourcePlant);
        }
        case DND_ITEM_TYPE.PLANT_ATTACK: {
          const {trait, sourcePlant} = item;
          const targetError = trait.getDataModel().getErrorOfUseOnTarget(game, sourcePlant, animal);
          return !targetError;
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
                     , traitTakeCoverRequest
                     , gamePlantAttackRequest
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
              if (traitDataModel.linkTargetType && traitDataModel.linkTargetType & CTT_PARAMETER.ANIMAL) {
                return {
                  type: DND_ITEM_TYPE.ANIMAL_LINK
                  , item: {
                    ...item
                    , animalId: animal.id
                  }
                };
              } else if (traitDataModel.linkTargetType && traitDataModel.linkTargetType & CTT_PARAMETER.PLANT) {
                return {
                  type: DND_ITEM_TYPE.PLANT_LINK
                  , item: {
                    ...item
                    , plantId: animal.id
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
          traitTakeFoodRequest(animal.id, item.sourceId);
          break;
        }

        case DND_ITEM_TYPE.TRAIT: {
          const {sourceAnimal, trait} = item;
          traitActivateRequest(sourceAnimal.id, trait.id, animal.id);
          break;
        }

        case DND_ITEM_TYPE.PLANT_ATTACK: {
          const {sourcePlant} = item;
          gamePlantAttackRequest(sourcePlant.id, animal.id);
          break;
        }

        case DND_ITEM_TYPE.TRAIT_SHELL: {
          const {trait} = item;
          traitTakeShellRequest(animal.id, trait.id);
          break;
        }

        case DND_ITEM_TYPE.COVER: {
          const {sourceId} = item;
          traitTakeCoverRequest(animal.id, sourceId);
          break;
        }
      }
    }
  })
)(Animal);

export const AnimatedAnimal = AnimatedHOC(({animal}) => `Animal#${animal.id}`)(InteractiveAnimal);