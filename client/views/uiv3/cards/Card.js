import React from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import CardTrait from "./CardTrait";

import GameStyles from "../GameStyles";
import IconButton from "@material-ui/core/IconButton";
import IconRotate from '@material-ui/icons/Cached';

const styles = ({
  card: {
    ...GameStyles.card
    , display: 'flex'
    , flexDirection: 'column'
  }
});

export const Card = ({classes, card}) => (
  <div className={classes.card}>
    {card.traitsCount === 1 && <CardTrait trait={card.trait1} single/>}
    {card.traitsCount === 2 && <CardTrait trait={card.trait1} double/>}
    {card.traitsCount === 2 && <CardTrait trait={card.trait2} double invert/>}
    {/*{card.traitsCount === 2 && <IconButton className={classes.rotate}><IconRotate/></IconButton>}*/}
  </div>
);

export default withStyles(styles)(Card);