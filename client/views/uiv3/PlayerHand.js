import React from 'react';
import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import Card from "./cards/Card";

import pick from 'lodash/pick';

const styles = {
  handContainer: {
    // display: 'flex'
    overflow: 'auto'
  }
  , hand: {
    display: 'flex'
    , margin: 2
    // , overflow: 'auto'
  }
  , card: {
    flex: '0 0 auto'
    , margin: 2
    , boxSizing: 'border-box'
  }
};

export const PlayerHand = ({classes, game, player}) => (
  <div className={classes.handContainer}>
    <div className={classes.hand}>
      {player.hand.map((card) => (
        <Card key={card.id} card={card} classes={pick(classes, 'card')}/>
      ))}
    </div>
  </div>
);

export default compose(
  withStyles(styles)
  , connect((state, props) => {
    const game = state.get('game');
    const player = game.getPlayer();
    return {game, player}
  })
)(PlayerHand);