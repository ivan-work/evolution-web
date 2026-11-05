import React from "react";
import T from 'i18n-react';
import cn from "classnames";
import PropTypes from "prop-types";
import repeat from "lodash/times";

import {compose, setPropTypes} from "recompose";
import {connect} from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";

import Food from "../food/Food";
import {InteractiveShell} from "../food/Shell";
import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";
import {InteractionSource} from "../InteractionManager";
import {InteractionItemType} from "../InteractionItemType";
import {LocationColors, LocationIcon} from "./LocationsStyles";
import GameStyles from "../GameStyles";

import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_COOLDOWN_LINK} from "../../../../shared/models/game/evolution/constants";
import {
  LOCATIONS
  , getLocationFood
  , getLocationLockLink
} from "../../../../shared/models/game/evolution/locations";

// Food token of a location: it can be given only to an animal from the same location
export const InteractiveLocationFood = compose(
  setPropTypes({
    index: PropTypes.number.isRequired
    , location: PropTypes.string.isRequired
  })
  , connect(({game}, {location}) => ({
    canStart: game.isPlayerTurn()
      && game.status.phase === PHASE.FEEDING
      && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.userId)
      && !game.cooldowns.checkFor(getLocationLockLink(location), game.userId)
  }))
  , InteractionSource(InteractionItemType.FOOD, {
    getIID: ({index, location}) => InteractionItemType.FOOD + index + location
    , canStart: ({canStart}) => canStart
    , onStart: ({location}) => ({location})
  })
)(Food);

const styles = {
  root: {
    height: '100%'
    , overflowX: 'hidden'
    , overflowY: 'auto'
    , padding: '4px 8px'
    , boxSizing: 'border-box'
  }
  , row: {
    display: 'flex'
    , alignItems: 'center'
    , minHeight: 33
    , paddingLeft: 4
    , borderLeft: '4px solid'
  }
  , rowLabel: {
    display: 'flex'
    , alignItems: 'center'
    , flex: '0 0 auto'
    , width: 130
    , fontSize: 14
    , fontWeight: 500
    , whiteSpace: 'nowrap'
  }
  , rowIcon: {
    fontSize: 20
    , marginRight: 4
  }
  // Only whole tokens are seen: the ones that don't fit wrap out of the row, the label has the exact number.
  // The padding keeps a pulsating token whole
  , rowFood: {
    display: 'flex'
    , flexWrap: 'wrap'
    , flex: '1 1 0px'
    , minWidth: 0
    , boxSizing: 'content-box'
    , height: GameStyles.iconSize
    , padding: 4
    , margin: -4
    , rowGap: 8
    , overflow: 'hidden'
  }
  , shells: {
    textAlign: 'center'
  }
  // Compressed toolbar: one line for all food bases
  , compressed: {
    display: 'flex'
    , alignItems: 'center'
    , justifyContent: 'space-around'
    , padding: 0
    , '& $row': {
      minHeight: 0
      , paddingLeft: 0
      , borderLeft: 'none'
    }
    , '& $rowLabel': {
      width: 'auto'
    }
    , '& $rowFood': {
      flex: '0 0 auto'
    }
  }
  , ...LOCATIONS.reduce((result, location) => ({
    ...result
    , [location]: {
      borderColor: LocationColors[location].border
      , '& $rowLabel': {
        color: LocationColors[location].main
      }
    }
  }), {})
};

export const LocationFoodRow = ({classes, location, food, compressed}) => (
  <div className={cn(classes.row, classes[location])}>
    <Typography component='div' className={classes.rowLabel}>
      <LocationIcon location={location} className={classes.rowIcon} />
      {compressed
        ? food
        : <span>{T.translate('Game.Location.' + location)}&nbsp;({food}){food > 0 ? ':' : ''}</span>}
    </Typography>
    <div className={classes.rowFood}>
      {repeat(compressed ? Math.min(food, 1) : food, i => (
        <InteractiveLocationFood key={i} index={i} location={location} />
      ))}
    </div>
  </div>
);

export const LocationsFood = ({classes, game, compressed}) => (
  <div className={cn(classes.root, {[classes.compressed]: compressed})}>
    {LOCATIONS.map(location => (
      <LocationFoodRow key={location}
                       classes={classes}
                       location={location}
                       compressed={compressed}
                       food={Math.max(getLocationFood(game, location), 0)} />
    ))}
    {game.getArea().shells.size > 0 && <div className={classes.shells}>
      {game.getArea().shells.map((trait) => <InteractiveShell key={trait.id} trait={trait} />).toList()}
    </div>}
  </div>
);

export default compose(
  withStyles(styles)
  , AnimatedHOC(() => `FoodContainer`)
)(LocationsFood);
