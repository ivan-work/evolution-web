import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import * as MDL from 'react-mdl';

import {Card} from './Card.jsx';

export class CardCollection extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const user = this.props.user;
    const game = this.props.game;
    return <div className="CardCollection">
      CardCollection
    </div>;
  }
}