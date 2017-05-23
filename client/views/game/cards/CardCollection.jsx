import React from 'react';
import PropTypes from 'prop-types'

import styles from '../../../styles.json';
const {CARD_WIDTH} = styles;

import './CardCollection.scss';

export class CardCollection extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired
    , isUser: PropTypes.bool.isRequired
  };

  render() {
    const {children, name, isUser, visible = true} = this.props;
    const cardsCount = React.Children.count(children);
    const shift = isUser ? CARD_WIDTH : 15;
    const size = CARD_WIDTH + shift * (cardsCount - 1);
    return <div className={`CardCollection ${name} ${visible ? '' : 'hidden'}`}>
      {React.Children.map(children, (card, index) =>
        this.renderCardPlace(card, shift * index))}
    </div>;
  }

  renderCardPlace(card, shift) {
    return <div className="CardPlace" key={card.id}>
      {card}
    </div>
    // return <div className="CardPlace" key={card.id} style={{
    //       transform: `translate(${shift}px,0px)`
    //     }}>
    //   {card}
    // </div>
  }
}