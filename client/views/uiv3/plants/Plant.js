import React from "react";
import T from "i18n-react";
import {compose, setDisplayName, setPropTypes} from "recompose";
import PropTypes from "prop-types";
import connect from "react-redux/es/connect/connect";
import {InteractionTarget} from "../InteractionManager";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {PHASE} from "../../../../shared/models/game/GameModel";
import PlantModel from "../../../../shared/models/game/evolution/plantarium/PlantModel";
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import repeat from "lodash/times";
import {InteractiveFood} from "../food/Food";
import InteractiveCover, {Cover} from "../food/Cover";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import GameStyles from "../GameStyles";
import PlantTrait from "./PlantTrait";
import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {CTT_PARAMETER, TRAIT_ANIMAL_FLAG} from "../../../../shared/models/game/evolution/constants";
import {gameDeployPlantTraitRequest} from "../../../../shared/actions/game";
import cn from "classnames";
import {AT_DEATH} from "../animations";

const DEATH_ANIMATION_TIME = `${AT_DEATH}ms`;

const styles = ({
  Plant: {
    ...GameStyles.plant
    , flex: `0 0 120px`
    , textAlign: 'center'
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
  // , '& .AnimalIcon': {
  //   verticalAlign: 'middle'
  // }
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
});

class BasePlant extends React.PureComponent {
  render() {
    const {classes, plant, children, canInteract, acceptInteraction} = this.props;

    const cnPlant = cn(
      classes.Plant
      , {canInteract}
    );

    const traitList = children || (plant.getTraits(true).toList()
      .reverse()
      .map(trait => <PlantTrait key={trait.id} trait={trait} host={plant} />));

    return (
      <div className={cnPlant} onClickCapture={acceptInteraction}>
        <Typography className={classes.name}>{T.translate(`Game.Plant.${plant.type}`)}</Typography>
        <div className={classes.food}>{repeat(plant.getFood(), i => <InteractiveFood key={i} index={i} sourceId={plant.id} />)}</div>
        <div className={classes.covers}>
          {repeat(plant.covers, i => <InteractiveCover key={i} sourceId={plant.id} />)}
          {repeat(plant.coverSlots - plant.covers, i => <Cover key={i} />)}
        </div>
        <div>
          {traitList}
        </div>
      </div>
    );
  }
}

const Plant = compose(
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
    gameDeployPlantTraitRequest
  })
  , InteractionTarget([DND_ITEM_TYPE.CARD_TRAIT], {
    canInteract: ({game, plant}, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          switch (game.status.phase) {
            case PHASE.DEPLOY:
              const {traitType} = item;
              const traitData = TraitModel.new(traitType).getDataModel();
              if (!(traitData.cardTargetType & CTT_PARAMETER.PLANT)) {
                return false;
              }
              return !traitData.getErrorOfTraitPlacement(game, plant);
            default:
              return false;
          }
        }
      }
      return false;
    }
    , onInteract: ({
                     game
                     , plant
                     , gameDeployPlantTraitRequest
                   }, {type, item}) => {
      switch (type) {
        case DND_ITEM_TYPE.CARD_TRAIT: {
          const {cardId, traitType, alternateTrait} = item;
          const traitDataModel = TraitModel.new(traitType).getDataModel();
          if (traitDataModel.cardTargetType & CTT_PARAMETER.LINK) {
            return {
              type: DND_ITEM_TYPE.PLANT_LINK
              , data: {
                ...item
                , plantId: plant.id
              }
            };
          } else {
            gameDeployPlantTraitRequest(cardId, plant.id, alternateTrait);
          }
          break;
        }
      }
    }
  })
)(Plant);

export const AnimatedPlant = AnimatedHOC(({plant}) => `Plant#${plant.id}`)(InteractivePlant);

export default AnimatedPlant;