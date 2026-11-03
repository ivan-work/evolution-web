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
import {AT_DEATH} from "../animations";
import {LocationColors, LocationIcon} from "./LocationsStyles";

import {gameDeployAnimalRequest} from "../../../../shared/actions/game";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {LOCATIONS, isContinent, getLocationLockLink} from "../../../../shared/models/game/evolution/locations";

const styles = theme => ({
  lanes: {
    display: 'flex'
    , flexFlow: 'row wrap'
    , alignItems: 'stretch'
    , width: '100%'
    , padding: 2
    , boxSizing: 'border-box'
  }
  , lane: {
    flex: '1 1 auto'
    , minWidth: GameStyles.defaultWidth + 30
    , display: 'flex'
    , flexDirection: 'column'
    , margin: 2
    , borderRadius: 6
    , border: '1px solid'
    , borderTopWidth: 4
    , overflow: 'hidden'
    , transition: 'opacity .25s'
  }
  , laneEmpty: {
    flex: '0 1 auto'
    , minWidth: 120
    , [theme.breakpoints.down('xs')]: {
      flex: '1 1 0'
      , minWidth: 90
    }
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
  , laneFull: {
    [theme.breakpoints.down('xs')]: {
      flexBasis: '100%'
    }
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
    , margin: 0
    , flex: '1 1 auto'
    , transition: 'opacity .25s'
  }
  , laneEmptyText: {
    fontSize: 12
    , color: '#888'
    , padding: '4px 8px 6px'
  }
  , zone: {
    ...GameStyles.animalBase
    , display: 'none'
    , minWidth: GameStyles.animalBase.minWidth / 2
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

const InteractiveLaneZone = compose(
  connect(null, {gameDeployAnimalRequest})
  , InteractionTarget([InteractionItemType.CARD_TRAIT], {
    onInteract: ({index, location, gameDeployAnimalRequest}, {item}) => {
      gameDeployAnimalRequest(item.cardId, index, location);
    }
  })
)(LaneZone);

// Zones between the animals of the lane; index is a position in the whole list of the player's animals
const renderLaneWithZones = (classes, location, continent, animals) => {
  const result = [];
  const zoneClass = classes.zone;
  animals.forEach(animal => {
    const index = continent.indexOf(animal);
    result.push(<InteractiveLaneZone key={'zone' + index} className={zoneClass} index={index} location={location} />);
    result.push(<AnimatedAnimal key={animal.id} animal={animal} />);
  });
  const lastIndex = animals.size > 0 ? continent.indexOf(animals.last()) + 1 : continent.size;
  result.push(<InteractiveLaneZone key={'zone' + lastIndex} className={zoneClass} index={lastIndex} location={location} />);
  return result;
};

// An animal that left the lane but is still in the game has migrated: no death animation for it
const hasMovedAway = (continent, location, previousIds) => previousIds.some(animalId => {
  const animal = continent.find(a => a.id === animalId);
  return !!animal && animal.location !== location;
});

export class LocationLane extends React.Component {
  previousIds = [];

  componentDidUpdate() {
    this.previousIds = this.props.animals.map(animal => animal.id).toArray();
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  render() {
    const {continent, location, animals} = this.props;
    return renderLocationLane({...this.props, transitionLeave: !hasMovedAway(continent, location, this.previousIds)});
  }
}

const renderLocationLane = ({classes, location, continent, animals, withZones, locked, transitionLeave}) => {
  const isEmpty = animals.size === 0;
  return (
    <div className={cn(classes.lane, classes[location], {
      [classes.laneEmpty]: isEmpty && !withZones
      , [classes.laneFull]: !isEmpty || withZones
      , [classes.laneLocked]: locked
    })}>
      <div className={classes.laneHeader}>
        <LocationIcon location={location} className={classes.laneIcon} />
        <Typography className={classes.laneTitle}>{T.translate('Game.Location.' + location)}</Typography>
        {locked && <Tooltip title={T.translate('Game.UI.Locations.Locked')}>
          <IconLock className={classes.laneLock} />
        </Tooltip>}
        <Typography className={classes.laneCount}>{animals.size}</Typography>
      </div>
      {isEmpty && <Typography className={classes.laneEmptyText}>
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
};

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
