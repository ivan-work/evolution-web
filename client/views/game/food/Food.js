import React from 'react';
import T from "i18n-react";
import PropTypes from 'prop-types';
import cn from 'classnames';
import noop from 'lodash/noop';

import {compose, setPropTypes} from "recompose";
import {connect} from "react-redux";

import Tooltip from "@material-ui/core/Tooltip";

import {InteractionItemType} from "../InteractionItemType";
import {TRAIT_COOLDOWN_LINK} from "../../../../shared/models/game/evolution/constants";
import {PHASE} from "../../../../shared/models/game/GameModel";

import IconFood from "../../icons/IconFood";

import {InteractionSource} from '../InteractionManager';

import withStyles from "@material-ui/core/styles/withStyles";
import GameStyles from "../GameStyles";

const styles = {
  Food: {
    fontSize: GameStyles.iconSize
    , stroke: GameStyles.defaultColorConfig.textDisabled
    , fill: GameStyles.defaultColorConfig.fillDisabled
    , transition: '.5s transform linear'
    , '&.isPlaceholder': {
      stroke: '#AAA'
      , fill: '#FFF'
    }
    , '&.canStart': {
      cursor: 'pointer'
      , fill: GameStyles.defaultColorConfig.fillActive
      , stroke: GameStyles.defaultColorConfig.fillActiveHover
    }
    , '&.canStart:hover, &.canStart:focus': {
      fill: GameStyles.defaultColorConfig.fillActiveHover
      , stroke: GameStyles.defaultColorConfig.textActive
      , outline: '0px solid white !important'
    }
    , '&.isInteracting': {
      fill: GameStyles.defaultColorConfig.fillInteracting
      , stroke: GameStyles.defaultColorConfig.textInteracting
      , animation: `interaction-pulsate 1000ms ease-in-out infinite`
    }
  }
};

export const Food = withStyles(styles)(({
                                          classes
                                          , className
                                          , canStart
                                          , isPlaceholder
                                          , startInteraction
                                          , isInteracting
                                        }) => (
  <Tooltip title={T.translate('Game.Icon.Food')}>
    <IconFood className={cn(classes.Food, className, {isPlaceholder, canStart, isInteracting})}
              onClick={startInteraction}
    />
  </Tooltip>
));

Food.defaultProps = {
  startInteraction: noop
};

export const InteractiveFood = compose(
  setPropTypes({
    index: PropTypes.number.isRequired
    , sourceId: PropTypes.string
  })
  , connect(state => {
    const game = state.game;
    return {
      canStart: game.isPlayerTurn()
        && game.status.phase === PHASE.FEEDING
        && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.userId)
    }
  })
  , InteractionSource(InteractionItemType.FOOD, {
    getIID: ({index, sourceId}) => InteractionItemType.FOOD + index + sourceId
    , canStart: ({canStart}) => canStart
    , onStart: ({sourceId}) => ({sourceId})
  })
)(Food);

export default Food;