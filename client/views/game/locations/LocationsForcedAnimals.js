import React from 'react';
import T from "i18n-react";

import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";

import {PHASE} from "../../../../shared/models/game/GameModel";
import {getForcedAnimals} from "../../../../shared/models/game/evolution/locations";

// Lies over the name line of the panel, so the lanes stay in place when it comes and goes
const style = {
  position: 'absolute'
  , top: 0
  , left: 0
  , right: 0
  , zIndex: 1
  , background: '#FFF3CD'
  , color: '#6B4E00'
  , borderRadius: 4
  , padding: '2px 8px'
  , fontSize: 14
};

// Restart rule: a player without cards and animals deploys two of the new cards as animals
export const LocationsForcedAnimals = ({count}) => (count > 0
    ? <Typography style={style}>{T.translate('Game.UI.Locations.ForcedAnimals', {count})}</Typography>
    : null
);

export default connect(({game}) => ({
  count: game.status.phase === PHASE.DEPLOY && game.getPlayer() && game.getPlayer().hand.size > 0
    ? getForcedAnimals(game, game.userId)
    : 0
}))(LocationsForcedAnimals);
