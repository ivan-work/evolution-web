import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import Deck from '../../game/cards/Deck.jsx';
import GameLog from '../../game/ui/GameLog.jsx';
import Pause from '../../game/ui/Pause.jsx';

import GameEndTurnButton from './GameEndTurnButton.jsx';
import {Timer} from '../../utils/Timer.jsx';

import './DeckSticker.scss';

export default ({game}) => {
  const {status, settings, question} = game;
  return (<div className='DeckSticker'>
    <h6 className='size'>{T.translate('Game.UI.Deck')} ({game.deck.size}):</h6>
    <div className='content'>
      <div className='deck'>
        {game.deck.size > 0 && <Deck deck={game.deck}/>}
      </div>
      <div className='controls'>
        <GameLog game={game}/>
        <Pause/>
      </div>
      <ul>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Turn')}:&nbsp;</span>
          <span className='value'>{status.turn}</span>
          &nbsp;/&nbsp;
          <span className='key'>{T.translate('Game.UI.Status.Round')}:&nbsp;</span>
          <span className='value'>{status.round}</span>
        </li>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Phase')}:&nbsp;</span>
          <span className='value'>{T.translate('Game.Phase.' + status.phase)}</span>
        </li>
        <li className='line'>
          <span className='key'>{T.translate('Game.UI.Status.Time')}:&nbsp;</span>
          <span className='value'>
          {(game.status.paused ? <span>{T.translate('Game.UI.Status.Pause')}</span>
            : !!question ? <Timer start={question.time} duration={settings.timeTraitResponse}/>
              : status.turnStartTime != null ? <Timer start={status.turnStartTime} duration={status.turnDuration}/>
                : '-')}
          </span>
        </li>
      </ul>
      {/*<div>*/}
      {/*<GameEndTurnButton game={game}/>*/}
      {/*</div>*/}
    </div>
  </div>)
}