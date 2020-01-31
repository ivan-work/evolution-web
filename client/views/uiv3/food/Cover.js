import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import noop from 'lodash/noop';

import SvgIcon from '@material-ui/core/SvgIcon';
// import IconCover from '@material-ui/icons/AllOut';

import {compose, fromRenderProps, setPropTypes, withHandlers, withProps} from "recompose";
import {connect} from "react-redux";

import withStyles from "@material-ui/core/styles/withStyles";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {TRAIT_COOLDOWN_LINK} from "../../../../shared/models/game/evolution/constants";

import {InteractionSource} from '../InteractionManager';
import GameStyles from "../GameStyles";
import {PHASE} from "../../../../shared/models/game/GameModel";

export const IconCover = (props) => (
  <SvgIcon {...props}>
    <path
      d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
  </SvgIcon>
);

const styles = {
  Cover: {
    fontSize: 32
    , stroke: GameStyles.defaultColorConfig.textDisabled
    , fill: GameStyles.defaultColorConfig.fillDisabled
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
      stroke: GameStyles.defaultColorConfig.textActive
      , fill: GameStyles.defaultColorConfig.fillActiveHover
    }
    , '&.isInteracting': {
      fill: GameStyles.defaultColorConfig.fillInteracting
      , stroke: GameStyles.defaultColorConfig.textInteracting
      , animation: `interaction-pulsate 1000ms ease-in-out infinite`
    }
  }
};

export const Cover = withStyles(styles)(({
                                           classes
                                           , className
                                           , isPlaceholder
                                           , canStart
                                           , startInteraction
                                           , isInteracting
                                         }) => (
  <IconCover className={cn(classes.Cover, className, {isPlaceholder, canStart, isInteracting})}
             onClick={startInteraction}
  />
));

Cover.defaultProps = {
  startInteraction: noop
};

export const InteractiveCover = compose(
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
  , InteractionSource(DND_ITEM_TYPE.COVER, {
    getIID: ({index, sourceId}) => DND_ITEM_TYPE.COVER + index + sourceId
    , canStart: ({canStart}) => canStart
    , onStart: ({sourceId}) => ({sourceId})
  })
)(Cover);

export default InteractiveCover;