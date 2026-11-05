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

const MAX_FOOD_ICONS = 5;

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
    , padding: '2px 4px'
    , boxSizing: 'border-box'
  }
  , title: {
    fontSize: 13
    , color: '#666'
    , textAlign: 'center'
  }
  , row: {
    display: 'flex'
    , alignItems: 'center'
    , minHeight: 30
    , borderRadius: 4
    , margin: '2px 0'
    , padding: '0 4px'
    , borderLeft: '4px solid'
  }
  , rowLabel: {
    display: 'flex'
    , alignItems: 'center'
    , flex: '0 0 auto'
    , width: 92
    , fontSize: 14
    , fontWeight: 500
  }
  , rowIcon: {
    fontSize: 18
    , marginRight: 4
  }
  , rowCount: {
    flex: '0 0 auto'
    , width: 24
    , fontSize: 15
    , fontWeight: 700
    , textAlign: 'right'
    , marginRight: 4
  }
  // Tokens overlap, so all of them and the rest counter fit the narrowest panel
  , rowFood: {
    display: 'flex'
    , flexWrap: 'nowrap'
    , alignItems: 'center'
    , '& svg': {
      fontSize: 24
    }
    , '& svg + svg': {
      marginLeft: -10
    }
  }
  , more: {
    fontSize: 13
    , color: '#666'
    , marginLeft: 2
  }
  , shells: {
    textAlign: 'center'
  }
  // Compressed toolbar: one line for all food bases
  , compressed: {
    display: 'flex'
    , alignItems: 'center'
    , justifyContent: 'space-around'
    , height: '100%'
    , '& $row': {
      borderLeft: 'none'
      , margin: 0
      , padding: 0
      , minHeight: 0
    }
    , '& $rowCount': {
      width: 'auto'
    }
  }
  , ...LOCATIONS.reduce((result, location) => ({
    ...result
    , [location]: {
      background: LocationColors[location].light
      , borderColor: LocationColors[location].border
      , color: LocationColors[location].main
      , '& $rowCount, & $rowLabel': {
        color: LocationColors[location].main
      }
    }
  }), {})
};

export const LocationFoodRow = ({classes, location, food, compressed}) => (
  <div className={cn(classes.row, classes[location])}>
    {!compressed && <Typography component='div' className={classes.rowLabel}>
      <LocationIcon location={location} className={classes.rowIcon} />
      {T.translate('Game.Location.' + location)}
    </Typography>}
    {compressed && <LocationIcon location={location} className={classes.rowIcon} />}
    <Typography component='span' className={classes.rowCount}>{food}</Typography>
    <div className={classes.rowFood}>
      {repeat(Math.min(food, compressed ? 1 : MAX_FOOD_ICONS), i => (
        <InteractiveLocationFood key={i} index={i} location={location} />
      ))}
      {!compressed && food > MAX_FOOD_ICONS && <span className={classes.more}>+{food - MAX_FOOD_ICONS}</span>}
    </div>
  </div>
);

export const LocationsFood = ({classes, game, compressed}) => (
  <div className={cn(classes.root, {[classes.compressed]: compressed})}>
    {!compressed && <Typography className={classes.title}>{T.translate('Game.UI.FoodBase')}</Typography>}
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
