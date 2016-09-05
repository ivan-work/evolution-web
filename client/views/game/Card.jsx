import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {CardModel} from '~/shared/models/game/CardModel';

export class Card extends React.Component {
  static propTypes = {
    model: React.PropTypes.instanceOf(CardModel).isRequired
    , index: React.PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const model = this.props.model;
    return <div className='Card' style={{
      top: this.props.defaultPosition[0] + 'px'
      , left: this.props.defaultPosition[1] + 'px'
    }}>
      <div className='inner'>
        {this.props.index}
        <br/>{model.name}
      </div>
    </div>;
  }
}
//componentDidMount() {
//  console.log(this.props.cardModel.id, 'componentDidMount')
//  const cardDOM = ReactDOM.findDOMNode(this);
//  if (this.props.animation) {
//    Velocity(cardDOM, {
//      left: this.props.animation.x
//      , top: this.props.animation.y
//    }, {duration: 0});
//    Velocity(cardDOM, {
//      left: this.props.position.x
//      , top: this.props.position.y
//    }, {duration: 200});
//  } else {
//    Velocity(cardDOM, {
//      left: this.props.position.x
//      , top: this.props.position.y
//    }, {duration: 0});
//  }
//}
//
//componentWillReceiveProps(nextProps) {
//  console.log(this.props.cardModel.id, 'componentWillReceiveProps')
//  const cardDOM = ReactDOM.findDOMNode(this);
//  Velocity(cardDOM, {
//    left: nextProps.position.x
//    , top: nextProps.position.y
//  }, {duration: 200});
//}