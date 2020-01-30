import React from "react";
import cn from "classnames";

import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";

import repeat from "lodash/times";

import {InteractiveFood} from "./Food";
import {InteractiveShell} from "./Shell";
import Plant from "../plants/Plant";
import {compose} from "recompose";
import withStyles from "@material-ui/core/styles/withStyles";


export default compose(
  withStyles({
    FoodContainer: {
      height: '100%'
      , overflow: 'hidden'
    }
  })
  , AnimatedHOC(() => `FoodContainer`)
)(
  ({classes, game}) => <div className={classes.FoodContainer}>
    {repeat(game.food, i => <InteractiveFood key={i} index={i}/>)}
    {/*{game.isPlantarium() && game.plants.valueSeq().map(plant => <Plant key={plant.id} plant={plant}/>)}*/}
    {game.getArea().shells.map((trait) => <InteractiveShell key={trait.id} trait={trait}/>).toList()}
  </div>
);