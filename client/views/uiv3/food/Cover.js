import React from 'react';
import T from "i18n-react";
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
import Tooltip from "@material-ui/core/Tooltip";

export const IconCover = React.forwardRef((props, ref) => (
  <SvgIcon {...props}>
    <path
      ref={ref}
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0" />
  </SvgIcon>
));

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
  <Tooltip title={T.translate('Game.Icon.Cover')}>
    <IconCover className={cn(classes.Cover, className, {isPlaceholder, canStart, isInteracting})}
               onClick={startInteraction}
    />
  </Tooltip>
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