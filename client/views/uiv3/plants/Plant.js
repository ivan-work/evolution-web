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
import InteractiveCover from "../food/Cover";
import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = ({
  Plant: {
    flex: `0 0 120px`
    , outline: '1px solid black'
  }
  , name: {
    display: 'block'
  }
  , food: {}
  , covers: {}
});

class BasePlant extends React.PureComponent {
  render() {
    const {classes, plant} = this.props;
    return (
      <div className={classes.Plant}>
        <Typography className={classes.name}>{T.translate(`Game.Plant.${plant.type}`)}</Typography>
        <div className={classes.food}>{repeat(plant.getFood(), i => <InteractiveFood key={i}/>)}</div>
        <div className={classes.covers}>{repeat(plant.covers, i => <InteractiveCover key={i}/>)}</div>
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
  , connect(({game}, {animal}) => {
    return {game}
  }, {})
  , InteractionTarget([], {
    canInteract: ({game, plant}, {type, item}) => {
      return false;
    }
    , onInteract: ({game, plant}, {type, item}) => {
      return false
    }
  })
)(Plant);

export const AnimatedPlant = AnimatedHOC(({plant}) => `Plant#${plant.id}`)(InteractivePlant);

export default AnimatedPlant;