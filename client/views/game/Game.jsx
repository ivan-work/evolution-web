import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import {Button, IconButton} from 'react-mdl';

import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';

import {Portal} from '../utils/Portal.jsx';
import {ControlGroup} from '../utils/ControlGroup.jsx';
import {GameFoodContainer} from './food/GameFoodContainer.jsx';
import CustomDragLayer from './dnd/CustomDragLayer.jsx';
import GamePlayers from './GamePlayers.jsx';
import TraitShell from './animals/TraitShell.jsx';

import GameScoreboardFinal from './ui/GameScoreboardFinal.jsx';

class Game extends React.Component {
  static contextTypes = {
    gameActions: PropTypes.object
  };

  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  render() {
    const {game} = this.props;

    const $traitTakeShell = this.context.gameActions;

    //<TraitSelectDialog game={game} $traitAnswer={this.context.gameActions.$traitDefenceAnswer}/>

    return <div className='Game'>
      <Portal target='header'>
        <Button id="Game$switchUI" onClick={this.context.gameActions.$switchUI}>{T.translate('Game.UI.SwitchUI.Old')}</Button>
        <ControlGroup name={T.translate('Game.Game')}>
          <Button id="Game$Exit" onClick={this.context.gameActions.$exit}>{T.translate('App.Room.$Exit')}</Button>
          <GameScoreboardFinal game={game}/>
        </ControlGroup>
      </Portal>

      {/*<Portal target='deck'>
       <DeckWrapper deck={game.deck} game={game}/>
       </Portal>*/}

      <div style={{
        position: 'absolute'
        , left: '50%'
        , top: '50%'
        , transform: `translate(-50%, -50%)`
      }}>
        {game.status.phase === PHASE.FEEDING && <GameFoodContainer food={game.food}/>}
        <div className='GameShellContainer'>
          {game.continents.get('standard').shells.map((shell) => <TraitShell key={shell.id} game={game} trait={shell}/>).toList()}
        </div>
      </div>

      <GamePlayers game={game}/>

      <CustomDragLayer />
    </div>;
  }
}

export default Game;