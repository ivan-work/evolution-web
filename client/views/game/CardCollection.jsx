import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import * as MDL from 'react-mdl';

import {Card} from './Card.jsx';
import {CardModel} from '../../../shared/models/game/CardModel';

export class CardCollection extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    if (props.cards) {
      this.state = props.cards
    } else if (props.count) {
      this.state = CardModel.generate(props.count)
    }
    this.count
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;
    return <div className="CardCollection">
      CardCollection
    </div>;
  }
}