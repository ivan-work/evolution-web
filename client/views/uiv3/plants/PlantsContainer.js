import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";

import Plant from "./Plant";
import GameStyles from "../GameStyles";
import {InteractiveShell} from "../food/Shell";

const styles = ({
  container: {
    ...GameStyles.gridContainerBase
    , minWidth: (GameStyles.defaultWidth + 20) * 3
    , minHeight: (GameStyles.animal.height + 20)
  }
});

export default withStyles(styles)(({classes, game}) => (
  <div className={classes.container}>
    {game.getArea().shells.map((trait) => <InteractiveShell key={trait.id} trait={trait}/>).toList()}
    {game.plants.valueSeq().map(plant => <Plant key={plant.id} plant={plant}/>)}
  </div>
))