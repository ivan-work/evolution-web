import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { CardModel } from '~/shared/models/game/CardModel';
import { DragSource } from 'react-dnd';

export const CARD_SIZE = {
  width: 60
  , height: 80
};

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
    const model = this.props.model || {name: 'cardback'};
    return <div className='Card' style={CARD_SIZE}>
      <div className='inner'>
        {this.props.index}
        <br/>{model.name}
      </div>
    </div>;
  }
}

export const DragCard = DragSource("Card"
  , {
    beginDrag: (props) => ({
      model: props.model
      , position: props.position
    })
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(props => props.connectDragSource(<div><Card {...props}/></div>));