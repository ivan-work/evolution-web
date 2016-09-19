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
    const connectDragSource = this.props.connectDragSource;
    const body = <div className='Card' style={CARD_SIZE}>
      <div className='inner'>
        {this.props.index}
        <br/>{model.name}
      </div>
    </div>;
    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const UnknownCard = (props) => <div className='Card' style={CARD_SIZE}>
  <div className='inner'>
    {props.index}
    <br/>Unknown card
  </div>
</div>;

export const DragCard = DragSource("Card"
  , {
    beginDrag: (props) => ({
      model: props.model
      , position: props.index
    })
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(Card);