import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import Deck from '../cards/Deck.jsx';
import Typography from "@material-ui/core/Typography/Typography";

export default ({game}) => {
  return (<div className='DeckSticker'>
    <Typography variant='h6'>{T.translate('Game.UI.Deck')}&nbsp;({game.deck.size}):</Typography>
    <div className='content'>
      <div className={'deck' + (game.deck.size > 0 ? '' : ' invisible')}>
        <Deck deck={game.deck}/>
      </div>
    </div>
  </div>)
}