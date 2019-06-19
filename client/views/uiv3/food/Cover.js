import React from 'react';
import cn from 'classnames';
import noop from 'lodash/noop';

import SvgIcon from '@material-ui/core/SvgIcon';
// import IconCover from '@material-ui/icons/AllOut';

import {compose, fromRenderProps, withHandlers, withProps} from "recompose";
import {connect} from "react-redux";

import withStyles from "@material-ui/core/styles/withStyles";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {TRAIT_COOLDOWN_LINK} from "../../../../shared/models/game/evolution/constants";

import {InteractionSource} from '../InteractionManager';
import GameStyles from "../GameStyles";

export const IconCover = (props) => (
  <SvgIcon {...props}>
    <path
      d="M16.21 4.16l4 4v-4zm4 12l-4 4h4zm-12 4l-4-4v4zm-4-12l4-4h-4zm12.95-.95c-2.73-2.73-7.17-2.73-9.9 0s-2.73 7.17 0 9.9 7.17 2.73 9.9 0 2.73-7.16 0-9.9zm-1.1 8.8c-2.13 2.13-5.57 2.13-7.7 0s-2.13-5.57 0-7.7 5.57-2.13 7.7 0 2.13 5.57 0 7.7z"/>
  </SvgIcon>
);

const styles = {
  Cover: {
    fontSize: 32
    , fill: 'gray'
    , '&.canStart': {
      cursor: 'pointer'
      , fill: GameStyles.defaultColorConfig.fillActiveHover
    }
    , '&.canStart:hover, &.canStart:focus': {
      stroke: GameStyles.defaultColorConfig.fillActiveHover
      , fill: GameStyles.defaultColorConfig.fill
    }
  }
};

export const Cover = withStyles(styles)(({classes, className, canStart, startInteraction}) => (
  <IconCover className={cn(classes.Cover, className, {canStart})}
             onClick={startInteraction}
  />
));

Cover.defaultProps = {
  startInteraction: noop
};

export const InteractiveCover = compose(
  connect(state => {
    const game = state.game;
    return {
      canStart: game.isPlayerTurn() && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.userId)
    }
  })
  , InteractionSource(DND_ITEM_TYPE.TRAIT_SHELL, {
    canStart: ({canStart}) => canStart
    , onStart: ({trait}) => ({trait})
  })
)(Cover);

export default InteractiveCover;