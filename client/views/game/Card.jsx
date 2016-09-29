import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';

import { CardModel } from '~/shared/models/game/CardModel';

export const CARD_SIZE = {
  width: 60
  , height: 80
};

export class Card extends React.Component {
  static propTypes = {
    model: React.PropTypes.instanceOf(CardModel).isRequired
    , index: React.PropTypes.number.isRequired
    , disabled: React.PropTypes.bool.isRequired
  };

  static defaultProps = {
    disabled: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {connectDragSource, disabled, model, isDragging} = this.props;

    const className = classnames({
      Card: true
      , disabled: disabled
      , enabled: !disabled
      , isDragging: isDragging
    });

    const body = <div className={className} style={CARD_SIZE}>
      <div className='inner'>
        {this.props.index}
        <br/>{model.name}
      </div>
    </div>;
    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragCard = DragSource(DND_ITEM_TYPE.CARD
  , {
    beginDrag: (props) => ({item: props.model})
    , canDrag: (props, monitor) => !props.disabled
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
  })
)(Card);