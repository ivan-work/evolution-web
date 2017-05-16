import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import Deck from '../../game/cards/Deck.jsx';

export default ({game}) => {
  return (<div className='DeckSticker'>
    <h6 className='size'>{T.translate('Game.UI.Deck')} ({game.deck.size}):</h6>
    <div className='content'>
      <div className={'deck' + (game.deck.size > 0 ? '' : ' invisible')}>
        <Deck deck={game.deck}/>
      </div>
    </div>
  </div>)
}