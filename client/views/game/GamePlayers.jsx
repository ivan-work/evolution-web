import React, {Component} from 'react';
import Measure from 'react-measure';

import {GameModel, GameModelClient} from '../../../shared/models/game/GameModel';

import PlayerWrapper from './PlayerWrapper.jsx';

import './GamePlayers.scss';

const r2g = (r) => r / Math.PI * 180;

export default class GamePlayers extends Component {
  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
  };

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
        {/*JSON.stringify({width, height})*/}
        {GameModel.sortPlayersFromIndex(game, player.index)
          .map((player, index) => {
          const angle = angleInitial + anglePerPlayer * index;
          const length = (width * height) / (Math.sqrt(Math.pow(width*Math.cos(angle), 2) + Math.pow(height*Math.sin(angle),2))) / 2 - 50;
          const upsideDown = (angle > Math.PI * .5 && angle < Math.PI * 1.5 ? -1 : +1);

          return <div key={player.id}
                      style={{
                          position: 'absolute'
                          , left: `${width / 2}px`
                          , top: `${height / 2}px`
                          , transform: `translate(-50%, 0) rotate(${angle}rad) translate(0, -100%) translate(0, ${length}px)`
                          , transformOrigin: `top`
                          }}>
            <div style={{transform: `rotate(${upsideDown > 0 ? 0 : Math.PI}rad)`}}>
              <PlayerWrapper game={game} player={player} upsideDown={upsideDown > 0}/>
            </div>
          </div>
          })}
      </div>
    </Measure>)
  }
}