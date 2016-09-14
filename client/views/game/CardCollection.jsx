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
    //, children: React.PropTypes.arrayOf(React.PropTypes.element.isRequired)
  };

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    //if (props.cards) {
    //  this.state = props.cards
    //} else if (typeof props.count === 'number') {
    //  this.state = CardModel.generate(props.count)
    //} else {
    //  throw new Error(`CardCollection[${this.props.name}] doesnt have .cards or .count`)
    //}
  }

  //
  //componentWillReceiveProps(nextProps) {
  //  //if (nextProps.cards) {
  //  //  this.state = nextProps.cards
  //  //} else if (typeof nextProps.count === 'number') {
  //  //  this.state = CardModel.generate(nextProps.count)
  //  //} else {
  //  //  console.error(`CardCollection[${this.props.name}] doesnt have .cards or .count`, this.props);
  //  //  throw new Error(`CardCollection[${this.props.name}] doesnt have .cards or .count: ${JSON.stringify(this.props)}`)
  //  //}
  //}

  render() {
    return <div className="CardCollection">
      {React.Children.map(this.props.children, (card, index) => {
        return <div className="CardPlace" key={index} style={{
          transform: `translate(${this.props.shift[0] * index}px,${this.props.shift[1] * index}px)`
        }}>
          {card}
        </div>
        })}
    </div>;
  }
}