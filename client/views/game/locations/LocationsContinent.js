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

// A lane takes its size from the panel, never from the animals inside: two animals in a row at least
const LANE_PADDING = 6;
const LANE_BASIS = (GameStyles.defaultWidth + 20) * 2 + LANE_PADDING * 2 + 2;
const ANIMAL_SLOT_HEIGHT = GameStyles.animal.height + 20;

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
    , position: 'relative'
    , display: 'flex'
    , flexDirection: 'column'
    , margin: 2
    , borderRadius: 6
    , border: '1px solid'
    , borderTopWidth: 4
    , transition: 'opacity .25s'
  }
  , laneLocked: {
    '& $laneBody': {
      opacity: .45
    }
  }
  // Deploy phase: clicks go through the lane to its drop area, animals and zones stay clickable
  , laneDeploy: {
    '& $laneHeader, & $laneBody': {
      pointerEvents: 'none'
    }
    , '& $laneBody > *': {
      pointerEvents: 'auto'
    }
  }
  , laneHeader: {
    position: 'relative'
    , display: 'flex'
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
  , laneCount: {
    marginLeft: 'auto'
    , paddingLeft: 8
    , fontSize: 13
    , opacity: .8
  }
  , laneLock: {
    fontSize: 16
    , marginLeft: 4
  }
  , laneBody: {
    ...GameStyles.gridContainerBase
    , position: 'relative'
    , justifyContent: 'flex-start'
    , margin: 0
    , padding: `0 ${LANE_PADDING}px`
    , flex: '1 1 auto'
    , minHeight: ANIMAL_SLOT_HEIGHT
    , transition: 'opacity .25s'
  }
  , laneEmptyText: {
    position: 'absolute'
    , top: '50%'
    , left: 0
    , right: 0
    , textAlign: 'center'
    , fontSize: 12
    , color: '#888'
    , pointerEvents: 'none'
  }
  // The whole lane is a target for a new animal: it lights up and takes no place
  , laneDrop: {
    position: 'absolute'
    , top: 0
    , right: 0
    , bottom: 0
    , left: 0
    , borderRadius: 4
    , '&.canInteract': {
      cursor: 'pointer'
      , boxShadow: 'inset 0 0 0 3px #060'
      , transition: GameStyles.animal.transition
    }
    , '&.canInteract:hover': {
      boxShadow: 'inset 0 0 0 3px red'
    }
  }
  , laneDropHint: {
    position: 'absolute'
    , top: 7
    , right: 32
    , fontSize: 12
    , fontWeight: 500
    , color: '#060'
    , whiteSpace: 'nowrap'
  }
  // A place between the animals: a mark over the gap, without a width of its own
  , zone: {
    flex: '0 0 0px'
    , position: 'relative'
    , height: ANIMAL_SLOT_HEIGHT
    , '&.canInteract::before': {
      content: '""'
      , position: 'absolute'
      , top: 10
      , bottom: 10
      , left: -5
      , width: 10
      , borderRadius: 5
      , background: '#060'
      , opacity: .4
      , cursor: 'pointer'
    }
    , '&.canInteract:hover::before': {
      background: 'red'
    }
  }
  , ...LOCATIONS.reduce((result, location) => ({
    ...result
    , [location]: {
      borderColor: LocationColors[location].border
      , background: LocationColors[location].light
      , '& $laneHeader': {
        color: LocationColors[location].main
      }
      , '& $laneTitle, & $laneCount': {
        color: LocationColors[location].main
      }
    }
  }), {})
});

const LaneZone = ({className, acceptInteraction, canInteract}) => (
  <div className={cn(className, {canInteract})} onClick={acceptInteraction} />
);

const LaneDrop = ({className, hintClassName, acceptInteraction, canInteract}) => (
  <div className={cn(className, {canInteract})} onClick={acceptInteraction}>
    {canInteract && <Typography className={hintClassName}>{T.translate('Game.UI.Locations.DeployHere')}</Typography>}
  </div>
);

const DeployTarget = compose(
  connect(null, {gameDeployAnimalRequest})
  , InteractionTarget([InteractionItemType.CARD_TRAIT], {
    onInteract: ({index, location, gameDeployAnimalRequest}, {item}) => {
      gameDeployAnimalRequest(item.cardId, index, location);
    }
  })
);

const InteractiveLaneZone = DeployTarget(LaneZone);
const InteractiveLaneDrop = DeployTarget(LaneDrop);

const getLaneEndIndex = (continent, animals) => (
  animals.size > 0 ? continent.indexOf(animals.last()) + 1 : continent.size
);

// Zones between the animals of the lane; index is a position in the whole list of the player's animals
const renderLaneWithZones = (classes, location, continent, animals) => {
  const result = [];
  const zoneClass = classes.zone;
  animals.forEach(animal => {
    const index = continent.indexOf(animal);
    result.push(<InteractiveLaneZone key={'zone' + index} className={zoneClass} index={index} location={location} />);
    result.push(<AnimatedAnimal key={animal.id} animal={animal} />);
  });
  if (animals.size > 0) {
    const lastIndex = getLaneEndIndex(continent, animals);
    result.push(<InteractiveLaneZone key={'zone' + lastIndex} className={zoneClass} index={lastIndex} location={location} />);
  }
  return result;
};

// An animal that left the lane but is still in the game has migrated: no death animation for it
const hasMovedAway = (continent, location, previousIds) => previousIds.some(animalId => {
  const animal = continent.find(a => a.id === animalId);
  return !!animal && animal.location !== location;
});

export class LocationLane extends React.Component {
  static contextType = SVGContext;

  previousIds = [];

  // Lines of paired traits follow the animals, the last time when the leave animation is over
  updateLinks() {
    this.context.updateSVGOverlay();
    clearTimeout(this.linksTimeout);
    this.linksTimeout = setTimeout(this.context.updateSVGOverlay, AT_DEATH + 50);
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

const renderLocationLane = ({classes, location, continent, animals, withZones, locked, transitionLeave}) => (
  <div className={cn(classes.lane, classes[location], {
    [classes.laneLocked]: locked
    , [classes.laneDeploy]: withZones
  })}>
    {withZones && <InteractiveLaneDrop className={classes.laneDrop}
                                       hintClassName={classes.laneDropHint}
                                       index={getLaneEndIndex(continent, animals)}
                                       location={location} />}
    <div className={classes.laneHeader}>
      <LocationIcon location={location} className={classes.laneIcon} />
      <Typography className={classes.laneTitle}>{T.translate('Game.Location.' + location)}</Typography>
      {locked && <Tooltip title={T.translate('Game.UI.Locations.Locked')}>
        <IconLock className={classes.laneLock} />
      </Tooltip>}
      <Typography className={classes.laneCount}>{animals.size}</Typography>
    </div>
    {animals.size === 0 && <Typography className={classes.laneEmptyText}>
      {T.translate('Game.UI.Locations.Empty')}
    </Typography>}
    <CSSTransitionGroup component="div"
                        className={classes.laneBody}
                        transitionName="Animate_Death"
                        transitionLeave={transitionLeave}
                        transitionEnterTimeout={1}
                        transitionLeaveTimeout={AT_DEATH}>
      {withZones
        ? renderLaneWithZones(classes, location, continent, animals)
        : animals.map(animal => <AnimatedAnimal key={animal.id} animal={animal} />)}
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
                    withZones={isDeployZones && isContinent(location)}
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
