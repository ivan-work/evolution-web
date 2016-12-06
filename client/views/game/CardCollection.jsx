import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {CARD_SIZE} from './Card.jsx';

export class CardCollection extends React.Component {
  static propTypes = {
    name: React.PropTypes.string.isRequired
    , isUser: React.PropTypes.bool.isRequired
  };

  render() {
    const {children, name, isUser} = this.props;
    const cardsCount = React.Children.count(children);
    const shift = isUser ? CARD_SIZE.width : 15;
    const size = CARD_SIZE.width + shift * (cardsCount - 1);
    return <div style={{margin: '0 auto', width: `${size}px`}}
                className={`CardCollection ${name}`}>
      {React.Children.map(children, (card, index) =>
        this.renderCardPlace(card, shift * index))}
    </div>;
  }

  renderCardPlace(card, shift) {
    return <div className="CardPlace" key={card.id} style={{
          transform: `translate(${shift}px,0px)`
        }}>
      {card}
    </div>
  }
}