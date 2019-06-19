import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";

import Paper from "@material-ui/core/Paper";

import Plant from "./Plant";

const styles = ({});

export default withStyles(styles)(({classes, game}) => <Paper className={classes.PlayerWrapper}>
  <div className={classes.ContinentContainer}>
    {game.plants.valueSeq().map(plant => <Plant key={plant.id} plant={plant}/>)}
  </div>
</Paper>)