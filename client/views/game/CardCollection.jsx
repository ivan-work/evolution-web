import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import * as MDL from 'react-mdl';

import Immutable from 'immutable';

import {Card} from './Card.jsx';
import {CardModel} from '../../../shared/models/game/CardModel';

export class CardCollection extends React.Component {

  static propTypes = {
    name: React.PropTypes.string.isRequired
    , shift: React.PropTypes.arrayOf(React.PropTypes.number)
  };

  constructor(props) {
    super(props);
  }

  getXYForCard(index) {
    return {
      x: this.props.shift[0] * index
      , y: this.props.shift[1] * index
    }
  }

  renderCardPlace(card, index) {
    const transform = this.getXYForCard(index);
    return <div className="CardPlace" key={index} style={{
          transform: `translate(${transform.x}px,${transform.y}px)`
        }}>
      {card}
    </div>
  }

  render() {
    return <div className={`CardCollection ${this.props.name}`}>
      {React.Children.map(this.props.children, (card, index) => this.renderCardPlace(card, index))}
    </div>;
  }
}