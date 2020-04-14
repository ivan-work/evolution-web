import React from "react";
import PropTypes from "prop-types";
import T from "i18n-react";
import {compose, setDisplayName, setPropTypes} from "recompose";
import cn from "classnames";
import repeat from "lodash/times";
import {connect} from "react-redux";

import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {AT_DEATH} from "../animations";
import {CTT_PARAMETER, TRAIT_TARGET_TYPE} from "../../../../shared/models/game/evolution/constants";
import {InteractionTarget} from "../InteractionManager";
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";

import Food, {InteractiveFood} from "../food/Food";
import InteractiveCover, {Cover} from "../food/Cover";
import PlantTrait from "./PlantTrait";

import PlantModel from "../../../../shared/models/game/evolution/plantarium/PlantModel";
import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import * as ptt from "../../../../shared/models/game/evolution/plantarium/plantTraitTypes";
import * as pt from "../../../../shared/models/game/evolution/plantarium/plantTypes";
import {traitActivateRequest} from "../../../../shared/actions/trait";
import {gameDeployTraitRequest} from "../../../../shared/actions/game";

import GameStyles from "../GameStyles";
import IconFruit from '@material-ui/icons/Apple';
import Tooltip from "@material-ui/core/Tooltip";

const DEATH_ANIMATION_TIME = `${AT_DEATH}ms`;

const styles = ({
  Plant: {
    ...GameStyles.plant
    , flex: `0 0 120px`
    , textAlign: 'center'

    , '& .PlantIcon': {
      verticalAlign: 'text-bottom',
      fill: '#6A0',
      width: '22px'
    }

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
    // , '& .AnimalIconText': {
    //   fontWeight: 700,
    //   fontSize: 24,
    //   lineHeight: 0,
    //   verticalAlign: 'middle'
    // }
    // , '& .AnimalIconFood': {
    //   fontSize: 24
    //   , fill: 'orange'
    // }
    , '&.velocity-animating': {
      zIndex: 2
    }
    , name: {}
    , food: {}
    , covers: {}
  }
});

class BasePlant extends React.PureComponent {
  render() {
    const {classes, game, plant, children, canInteract, acceptInteraction} = this.props;

    const cnPlant = cn(
      classes.Plant
      , {canInteract}
    );

    const traitList = children || (plant.getTraits(true).toList()
      .reverse()
      .map(trait => <PlantTrait key={trait.id} trait={trait} sourcePlant={plant} />));

    const traitCarnivorous = plant.hasTrait(ptt.PlantTraitHiddenCarnivorous);

    return (
      <div className={cnPlant} onClickCapture={acceptInteraction}>
        <Typography className={classes.name}>
          {T.translate(`Game.Plant.${plant.type}`)}
          {plant.isFruit() && (
            <Tooltip title={T.translate('Game.Icon.Fruit')}>
              <IconFruit className='PlantIcon'/>
            </Tooltip>
          )}
          {/*{plant.getNextFood(game, plant)}*/}
        </Typography>
        <div className={classes.food}>
          {repeat(plant.getFood(), i => (
            <InteractiveFood key={i} index={i} sourceId={plant.id} />
          ))}
          {game && repeat(plant.getNextFood(game, plant), i => (
            <Food key={i} isPlaceholder />
          ))}
        </div>
        <div className={classes.covers}>
          {repeat(plant.covers, i => <InteractiveCover key={i} index={i} sourceId={plant.id} />)}
          {repeat(plant.coverSlots - plant.covers, i => <Cover key={i} isPlaceholder />)}
        </div>
        <div>
          {traitCarnivorous && <PlantTrait trait={traitCarnivorous} sourcePlant={plant} />}
          {traitList}
        </div>
      </div>
    );
  }
}

export const Plant = compose(
  setDisplayName('Plant')
  , setPropTypes({plant: PropTypes.instanceOf(PlantModel).isRequired})
  , withStyles(styles)
  , connect(({game}) => ({game}))
)(BasePlant);

const InteractivePlant = compose(
  setDisplayName('InteractivePlant')
  , setPropTypes({plant: PropTypes.instanceOf(PlantModel).isRequired})
  , connect(({game}, {plant}) => {
    return {game}
  }, {
    gameDeployTraitRequest
    , traitActivateRequest
  })
  , InteractionTarget([DND_ITEM_TYPE.CARD_TRAIT, DND_ITEM_TYPE.PLANT_LINK, DND_ITEM_TYPE.TRAIT], {
    canInteract: ({game, plant}, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.TRAIT: {
          const {trait, sourceAnimal} = item;
          const traitDataModel = trait.getDataModel();
          if (traitDataModel.targetType !== TRAIT_TARGET_TYPE.PLANT) return;
          const targetError = traitDataModel.getErrorOfUseOnTarget(game, sourceAnimal, plant);
          return !targetError;
        }
        case DND_ITEM_TYPE.CARD_TRAIT: {
          const {traitType} = item;
          const traitData = TraitModel.new(traitType).getDataModel();
          if (!(traitData.cardTargetType & CTT_PARAMETER.PLANT)) {
            return false;
          }
          return !traitData.getErrorOfTraitPlacement(plant);
        }
        case DND_ITEM_TYPE.PLANT_LINK: {
          const {traitType, plantId, alternateTrait} = item;
          const sourceEntity = game.getEntity(plantId);
          return (
            plant !== sourceEntity
            && !TraitModel.LinkBetweenCheck(traitType, sourceEntity, plant)
          );
        }
      }
      return false;
    }
    , onInteract: ({
                     game
                     , plant
                     , gameDeployTraitRequest
                     , traitActivateRequest
                   }, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          const {cardId, traitType, alternateTrait} = item;
          const traitDataModel = TraitModel.new(traitType).getDataModel();
          if (traitDataModel.linkTargetType) {
            return {
              type: DND_ITEM_TYPE.PLANT_LINK
              , item: {
                ...item
                , plantId: plant.id
              }
            };
          } else {
            gameDeployTraitRequest(cardId, plant.id, alternateTrait);
          }
          break;
        }
        case DND_ITEM_TYPE.PLANT_LINK: {
          const {cardId, alternateTrait, plantId} = item;
          gameDeployTraitRequest(cardId, plantId, alternateTrait, plant.id);
          break;
        }
        case DND_ITEM_TYPE.TRAIT: {
          const {sourceAnimal, trait} = item;
          traitActivateRequest(sourceAnimal.id, trait.id, plant.id);
          break;
        }
      }
    }
  })
)(Plant);

export const AnimatedPlant = AnimatedHOC(({plant}) => `Plant#${plant.id}`)(InteractivePlant);

export default AnimatedPlant;