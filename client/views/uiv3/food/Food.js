import React from 'react';
import cn from 'classnames';
import noop from 'lodash/noop';

import IconFood from '@material-ui/icons/Spa';

import {compose, fromRenderProps, withHandlers, withProps} from "recompose";
import {connect} from "react-redux";

import withStyles from "@material-ui/core/styles/withStyles";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {TRAIT_COOLDOWN_LINK} from "../../../../shared/models/game/evolution/constants";

import {InteractionSource} from '../InteractionManager';

const styles = {
  Food: {
    fontSize: 32
    , fill: 'gray'
    , '&.canStart': {
      cursor: 'pointer'
      , fill: 'green'
    }
    , '&.canStart:hover, &.canStart:focus': {
      fill: 'lightgreen'
      , stroke: 'red'
      , outline: '0px solid white !important'
    }
  }
};

export const Food =  withStyles(styles)(({classes, className, canStart, startInteraction}) => (
  <IconFood className={cn(classes.Food, className, {canStart})}
            onClick={startInteraction}
  />
));

Food.defaultProps = {
  startInteraction: noop
};

export const InteractiveFood = compose(
  connect(state => {
    const game = state.game;
    return {
      canStart: game.isPlayerTurn() && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.userId)
    }
  })
  , InteractionSource(DND_ITEM_TYPE.FOOD, {
    canStart: ({canStart}) => canStart
    , onStart: (props) => ({help: 'Peretashite edu na zhivotne'})
  })
)(Food);

export default Food;