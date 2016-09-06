import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import * as MDL from 'react-mdl';

import Immutable from 'immutable';

import {Card} from './Card.jsx';
import {CardModel} from '../../../shared/models/game/CardModel';

export class CardCollection extends React.Component {
  static defaultProps = {
    position: {top: 0, left: 0}
    , shift: [0, 10]
  };

  static propTypes = {
    name: React.PropTypes.string.isRequired
    , position: React.PropTypes.shape({
      top: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
      , right: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
      , bottom: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
      , left: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string])
    })
    , shift: React.PropTypes.arrayOf(React.PropTypes.number)
    , cards: React.PropTypes.instanceOf(Immutable.List)
    , count: React.PropTypes.number
  };

  constructor(props) {
    super(props);
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    if (props.cards) {
      this.state = props.cards
    } else if (typeof props.count === 'number') {
      this.state = CardModel.generate(props.count)
    } else {
      throw new Error(`CardCollection[${this.props.name}] doesnt have .cards or .count`)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cards) {
      this.state = nextProps.cards
    } else if (typeof nextProps.count === 'number') {
      this.state = CardModel.generate(nextProps.count)
    } else {
      throw new Error(`CardCollection[${this.props.name}] doesnt have .cards or .count`)
    }
  }

  render() {
    //console.log(this.state)
    return <div className="CardCollection" style={this.props.position}>
      {this.state.map((cardModel, index) => {
        return <Card
          key={index} index={index}
          defaultPosition={[this.props.shift[0] * index, this.props.shift[1] * index]}
          model={cardModel}
        />
        })}
    </div>;
  }
}