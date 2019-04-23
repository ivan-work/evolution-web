import React, {Fragment} from 'react';
import cn from 'classnames';
import T from "i18n-react";

import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import GameStyles from "../GameStyles";

import Animal from '../animals/Animal';
import {InteractionTarget} from "../InteractionManager";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import {gameDeployAnimalRequest} from "../../../../shared/actions/game";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {SVGContextSpy} from "../SVGContext";

const styles = {
  continent: {
    display: 'flex'
    , margin: '4px auto'
    , flexFlow: 'row wrap'
    , justifyContent: 'center'
    , alignContent: 'start'
    , minWidth: (GameStyles.defaultWidth + 20) * 3
    , minHeight: (GameStyles.animal.height + 20)
    , alignItems: 'flex-start'

    , '& .ContinentZone': {
      ...GameStyles.animalBase
      , display: 'none'
      , minWidth: GameStyles.animalBase.minWidth / 2
      // , minWidth: 0
      // , transition: 'min-width .25s'
    }
    , '& .ContinentZone.canInteract': {
      display: 'block'
      , ...GameStyles.animalCanInteract
      , transition: GameStyles.animal.transition
    }
  }
};

const ContinentZone = ({index, acceptInteraction, canInteract}) => (
  <div className={cn('ContinentZone', {canInteract})} onClick={acceptInteraction}/>
);
const InteractiveContinentZone = compose(
  connect(null, {gameDeployAnimalRequest})
  , InteractionTarget([DND_ITEM_TYPE.CARD_TRAIT], {
    onInteract: ({index, gameDeployAnimalRequest}, {item}) => {
      const {cardId} = item;
      gameDeployAnimalRequest(cardId, index);
    }
  })
)(ContinentZone);

const getZoneList = (continent) => {
  const continentSize = continent.size * 2 + 1;
  const zones = [];
  for (let i = 0; i < continentSize; ++i) {
    zones.push(i % 2 && continent.get(i / 2));
  }
  return zones;
};

const renderZoneListDeploy = (continent) => {
  return getZoneList(continent).map((animal, index) => (
    animal ? <Animal key={animal.id} animal={animal}/>
      : <InteractiveContinentZone key={index} index={index / 2}/>
  ))
};

const renderZoneListOther = (continent) => {
  return continent.map(animal => <Animal key={animal.id} animal={animal}/>)
};

export const Continent = ({classes, renderZoneList, continent}) => (
  <div className={classes.continent}>
    {renderZoneList(continent)}
  </div>
);

export default compose(
  withStyles(styles)
  , connect(({game}, {playerId}) => {
    const player = game.getPlayer(playerId);
    const isUserContinent = game.userId === playerId;
    const isDeploy = game.status.phase === PHASE.DEPLOY;
    const renderZoneList = isUserContinent && isDeploy ? renderZoneListDeploy : renderZoneListOther;
    return {
      renderZoneList
      , continent: player.continent.toList()
    }
  })
)(Continent);