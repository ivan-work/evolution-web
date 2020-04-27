import React from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import {InteractiveCardTrait} from "./CardTrait";

import GameStyles from "../GameStyles";

const styles = ({
  Card: {
    width: 90
    , height: 90 / 3 * 4
    , backgroundColor: GameStyles.defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
    , display: 'flex'
    , flexDirection: 'column'
  }
  , traitContainer: {
    flex: '1 1 0'
  }
});

export const Card = withStyles(styles)(({classes, card}) => (
  <div className={classes.Card}>
    {card.traitsCount === 1 && <InteractiveCardTrait cardId={card.id} trait={card.trait1} single/>}
    {card.traitsCount === 2 && <InteractiveCardTrait cardId={card.id} trait={card.trait1} double/>}
    {card.traitsCount === 2 && <InteractiveCardTrait cardId={card.id} trait={card.trait2} double invert/>}
    {/*{card.traitsCount === 1 && <div className={classes.traitContainer}><CardTrait trait={card.trait1} single/></div>}*/}
    {/*{card.traitsCount === 2 && <div className={classes.traitContainer}><CardTrait trait={card.trait1} double/></div>}*/}
    {/*{card.traitsCount === 2 && <div className={classes.traitContainer}><CardTrait trait={card.trait2} double invert/></div>}*/}
    {/*{card.traitsCount === 2 && <IconButton className={classes.rotate}><IconRotate/></IconButton>}*/}
  </div>
));

export default Card;
