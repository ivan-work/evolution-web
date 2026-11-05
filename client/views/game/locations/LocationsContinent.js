import React from 'react';
import T from "i18n-react";
import cn from 'classnames';

import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconLock from '@material-ui/icons/Lock';
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";

import GameStyles from "../GameStyles";
import {AnimatedAnimal} from '../animals/Animal';
import {InteractionTarget} from "../InteractionManager";
import {InteractionItemType} from "../InteractionItemType";
import {SVGContext} from "../SVGContext";
import {AT_DEATH} from "../animations";
import {LocationColors, LocationIcon} from "./LocationsStyles";

import {gameDeployAnimalRequest} from "../../../../shared/actions/game";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {LOCATIONS, isContinent, getLocationLockLink} from "../../../../shared/models/game/evolution/locations";

// A lane takes its size from the panel, never from the animals inside:
// a row holds two animals and a narrow zone at least
const LANE_BASIS = (GameStyles.defaultWidth + 20) * 2 + 30;

const styles = theme => ({
  lanes: {
    display: 'flex'
    , flexFlow: 'row wrap'
    , alignItems: 'stretch'
    , alignContent: 'flex-start'
    , width: '100%'
    , padding: 2
    , boxSizing: 'border-box'
  }
  , lane: {
    flex: `1 1 ${LANE_BASIS}px`
    , boxSizing: 'border-box'
    , display: 'flex'
    , flexDirection: 'column'
    , margin: 2
    , borderRadius: 6
    , border: '1px solid'
    , borderTopWidth: 4
  }
  , laneLocked: {
    '& $laneBody': {
      opacity: .45
    }
  }
  , laneHeader: {
    display: 'flex'
    , alignItems: 'center'
    , padding: '2px 8px'
    , minHeight: 26
  }
  , laneIcon: {
    fontSize: 20
    , marginRight: 4
  }
  , laneTitle: {
    fontWeight: 500
    , fontSize: 14
    , ...GameStyles.ellipsis
  }
  , laneLock: {
    fontSize: 16
    , marginLeft: 4
  }
  , laneBody: {
    ...GameStyles.gridContainerBase
    , margin: 0
    , flex: '1 1 auto'
    , minHeight: GameStyles.animal.height + 20
    , transition: 'opacity .25s'
  }
  // The usual zone for a new animal, at the end of the lane. It takes what is left of the row,
  // so a picked card doesn't open a new row and the lanes stay in place
  , zone: {
    ...GameStyles.animalBase
    , flex: '1 1 0px'
    , minWidth: 0
    , maxWidth: GameStyles.animalBase.minWidth / 2
    , display: 'none'
    , '&.canInteract': {
      display: 'block'
      , ...GameStyles.animalCanInteract
      , transition: GameStyles.animal.transition
    }
  }
  , ...LOCATIONS.reduce((result, location) => ({
    ...result
    , [location]: {
      borderColor: LocationColors[location].border
      , '& $laneTitle': {
        color: LocationColors[location].main
      }
    }
  }), {})
});

const LaneZone = ({className, acceptInteraction, canInteract}) => (
  <div className={cn(className, {canInteract})} onClick={acceptInteraction} />
);

const InteractiveLaneZone = compose(
  connect(null, {gameDeployAnimalRequest})
  , InteractionTarget([InteractionItemType.CARD_TRAIT], {
    onInteract: ({index, location, gameDeployAnimalRequest}, {item}) => {
      gameDeployAnimalRequest(item.cardId, index, location);
    }
  })
)(LaneZone);

// A position in the whole list of the player's animals: after the last animal of the lane
const getLaneEndIndex = (continent, animals) => (
  animals.size > 0 ? continent.indexOf(animals.last()) + 1 : continent.size
);

// An animal that left the lane but is still in the game has migrated: no death animation for it
const hasMovedAway = (continent, location, previousIds) => previousIds.some(animalId => {
  const animal = continent.find(a => a.id === animalId);
  return !!animal && animal.location !== location;
});

export class LocationLane extends React.Component {
  static contextType = SVGContext;

  previousIds = [];

  // Lines of paired traits follow the animals. The last update comes when the leave animation is over
  // and doesn't wait for the debounce: dealing cards after an extinction keeps postponing it
  updateLinks() {
    this.context.updateSVGOverlay();
    clearTimeout(this.linksTimeout);
    this.linksTimeout = setTimeout(this.context.updateSVGOverlayNow, AT_DEATH + 50);
  }

  componentDidUpdate() {
    const animalIds = this.props.animals.map(animal => animal.id).toArray();
    if (animalIds.join() !== this.previousIds.join()) this.updateLinks();
    this.previousIds = animalIds;
  }

  componentDidMount() {
    this.previousIds = this.props.animals.map(animal => animal.id).toArray();
  }

  componentWillUnmount() {
    clearTimeout(this.linksTimeout);
  }

  render() {
    const {continent, location} = this.props;
    return renderLocationLane({...this.props, transitionLeave: !hasMovedAway(continent, location, this.previousIds)});
  }
}

const renderLocationLane = ({classes, location, continent, animals, withZone, locked, transitionLeave}) => (
  <div className={cn(classes.lane, classes[location], {[classes.laneLocked]: locked})}>
    <div className={classes.laneHeader}>
      <LocationIcon location={location} className={classes.laneIcon} />
      <Typography className={classes.laneTitle}>{T.translate('Game.Location.' + location)}</Typography>
      {locked && <Tooltip title={T.translate('Game.UI.Locations.Locked')}>
        <IconLock className={classes.laneLock} />
      </Tooltip>}
    </div>
    <CSSTransitionGroup component="div"
                        className={classes.laneBody}
                        transitionName="Animate_Death"
                        transitionLeave={transitionLeave}
                        transitionEnterTimeout={1}
                        transitionLeaveTimeout={AT_DEATH}>
      {animals.map(animal => <AnimatedAnimal key={animal.id} animal={animal} />)}
      {withZone && <InteractiveLaneZone key='zone'
                                        className={classes.zone}
                                        index={getLaneEndIndex(continent, animals)}
                                        location={location} />}
    </CSSTransitionGroup>
  </div>
);

export const LocationsContinent = ({classes, continent, isDeployZones, lockedLocations}) => (
  <div className={classes.lanes}>
    {LOCATIONS.map(location => (
      <LocationLane key={location}
                    classes={classes}
                    location={location}
                    continent={continent}
                    animals={continent.filter(animal => animal.location === location)}
                    withZone={isDeployZones && isContinent(location)}
                    locked={!!lockedLocations[location]} />
    ))}
  </div>
);

export default compose(
  withStyles(styles)
  , connect(({game}, {playerId}) => {
    const player = game.getPlayer(playerId);
    const isUserContinent = game.userId === playerId;
    const isDeploy = game.status.phase === PHASE.DEPLOY;
    const isActivePlayer = game.status.phase === PHASE.FEEDING && game.status.currentPlayer === playerId;
    // In a round of the feeding phase the player acts in one location only
    const lockedLocations = LOCATIONS.reduce((result, location) => ({
      ...result
      , [location]: isActivePlayer && game.cooldowns.checkFor(getLocationLockLink(location), playerId)
    }), {});
    return {
      continent: player.continent.toList()
      , isDeployZones: isUserContinent && isDeploy
      , lockedLocations
    }
  })
)(LocationsContinent);
