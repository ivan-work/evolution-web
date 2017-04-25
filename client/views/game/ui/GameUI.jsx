import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';

import {GameProvider} from '../providers/GameProvider.jsx';
import {PortalTarget} from '../../utils/PortalTarget.jsx';
import {Button} from 'react-mdl';
import PlayersList from './PlayersList.jsx';
import {GameStatusDisplay} from './GameStatusDisplay.jsx';
import TraitDefenceDialog from './TraitDefenceDialog.jsx';
import TraitActivateDialog from './TraitActivateDialog.jsx';
import GameTimedOutDialog from './GameTimedOutDialog.jsx';
import Pause from './Pause.jsx';

import {TraitIntellect} from '../../../../shared/models/game/evolution/traitsData';
import {QuestionRecord} from '../../../../shared/models/game/GameModel.js';

import Deck from '../cards/Deck.jsx';
import GameLog from './GameLog.jsx';

import Chat from '../../Chat.jsx';

import './GameUI.scss';

class _GameUI extends React.Component {
  static displayName = 'GameUI';

  static contextTypes = {
    gameActions: PropTypes.object
  };

  render() {
    const {game} = this.props;
    let traits, onSelectTrait;
    if (game.question && game.question.id && game.question.type === QuestionRecord.INTELLECT) {
      traits = TraitIntellect.getTargets(game, game.question.sourceAid, game.question.targetAid);
      onSelectTrait = (targetId) => {
        this.context.gameActions.$traitAnswer(game.question.traitId, targetId)
      }
    }
    return (
      <div className='GameUI'>
        {game.getPlayer() && <GameTimedOutDialog show={game.getPlayer().timedOut}/>}

        <TraitDefenceDialog game={game} $traitAnswer={this.context.gameActions.$traitAnswer}/>

        <TraitActivateDialog game={game} traits={traits} onSelectTrait={onSelectTrait} allowNothing/>

        <PlayersList game={game}/>

        <div> {/*Firefox fix =/*/}
          {game.getPlayer() &&
          <Button id="Game$endTurn" colored={game.getPlayer().acted} accent={!game.getPlayer().acted} raised
                  disabled={!game.isPlayerTurn()}
                  style={{width: '100%'}}
                  onClick={this.context.gameActions.$endTurn}>
            {T.translate(game.getPlayer().acted ? 'Game.UI.EndTurn' : 'Game.UI.EndPhase')}
          </Button>}
        </div>

        <GameStatusDisplay game={game}/>

        <div>
          <h6>{T.translate('Game.UI.Deck')}: ({game.deck.size})</h6>
          <div className='DeckWrapper'>
            <Deck deck={game.deck}/>
            <GameLog game={game}/>
            <Pause/>
          </div>
        </div>

        <Chat chatTargetType='ROOM' roomId={game.roomId}/>
      </div>);
  }
}

export const GameUI = GameProvider(_GameUI);

//export const GameUI = GameProvider(({game, isPlayerTurn}) =>;

GameUI.propTypes = {
  // by GameProvider
  game: PropTypes.object
};