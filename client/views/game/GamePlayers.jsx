import React, {Component} from 'react';
import Measure from 'react-measure';

import {GAME_POSITIONS} from './GAME_POSITIONS';

import cn from 'classnames';

import {GameModel, GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {CardCollection} from './CardCollection.jsx';
import {Card, DragCard} from './Card.jsx';
import {ContinentDeploy} from './continent/ContinentDeploy.jsx';
import {ContinentFeeding} from './continent/ContinentFeeding.jsx';

import './GamePlayers.scss';

const r2g = (r) => r / Math.PI * 180;

export default class GamePlayers extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dimensions: {
        width: -1,
        height: -1
      }
    }
  }

  render() {
    const {game} = this.props;
    const player = game.getPlayer();
    const {width, height} = this.state.dimensions;

    const angleInitial = 0;
    const anglePerPlayer = Math.PI * 2 / game.players.size;

    return (<Measure onMeasure={(dimensions) => this.setState({dimensions})}>
      <div className='GamePlayers'>
        <div className='marker' style={{position: 'absolute', top: `${height/2}px`, left: `${width/2}px`}}></div>
        {GameModel.sortPlayersFromIndex(game, player.index)
          .toArray()
          .map((player, index) => {
          const angle = angleInitial + anglePerPlayer * index;
          const length = (width > height ? height : width) / 2 - 10;
          const upsideDown = (angle > Math.PI * .5 && angle < Math.PI * 1.5 ? -1 : +1);
          const isUser = game.getPlayer().id === player.id;

          const innerElements = [
            this.renderContinent(game, player.continent, isUser)
            , this.renderCardCollection(game, player, isUser)
            ];

          return <div key={player.id}
                      style={{
                          position: 'absolute'
                          , background: '#aaa'
                          , left: `${width / 2}px`
                          , top: `${height / 2}px`
                          , transform: `translate(-50%, 0) rotate(${angle}rad) translate(0, -100%) translate(0, ${length}px)`
                          , transformOrigin: `top`
                          }}>
            <div style={{
                          background: '#999'
                          , transform: `rotate(${upsideDown < 0 ? Math.PI : 0}rad)`
                          }}>
              <div className={cn({PlayerWrapper: true, UserWrapper: isUser, EnemyWrapper: !isUser})}
                   key={player.id}
                   data-player-id={player.id}>
                {upsideDown > 0 ? innerElements : innerElements.reverse()}
              </div>
            </div>
          </div>
          })}
      </div>
    </Measure>)
  }

  renderContinent(game, continent, isUser) {
    const ContinentClass = (game.status.phase === PHASE.DEPLOY
      ? ContinentDeploy
      : ContinentFeeding);

    return (<ContinentClass
      isUserContinent={isUser}
      continent={continent}
    />)
  }

  renderCardCollection(game, player, isUser) {
    const dragEnabled = isUser
      && game.status.phase === PHASE.DEPLOY
      && game.isPlayerTurn();

    return (<CardCollection
      name={isUser ? 'Hand' : player.id}
      shift={[isUser ? 55 : 20, 0]}>
      {player.hand.toArray().map((cardModel, i) =>
      <DragCard
        key={cardModel.id}
        card={cardModel}
        ref={this.props.connectRef('Card#'+cardModel.id)}
        dragEnabled={dragEnabled}/>
        )}
    </CardCollection>)
  }
}