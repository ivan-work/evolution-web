import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import { CardModel } from '~/shared/models/game/CardModel';

export const CARD_SIZE = {
  width: 60
  , height: 80
};

export class Card extends React.Component {
  static propTypes = {
    card: React.PropTypes.instanceOf(CardModel).isRequired
    , disabled: React.PropTypes.bool
  };

  static defaultProps = {
    disabled: false
    , isDragging: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (this.props.connectDragPreview)
      this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const {disabled, connectDragSource, isDragging} = this.props;
    let card = this.props.card;
    if (!card) {
      card = {name: 'UNKNOWN'}
    }

    const className = classnames({
      Card: true
      , disabled: disabled
      , enabled: !disabled
      , isDragging: isDragging
    });

    const body = <div className={className} style={CARD_SIZE}>
      <div className='inner'>
        {card.name} {isDragging}
      </div>
    </div>;
    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragCard = DragSource(DND_ITEM_TYPE.CARD
  , {
    beginDrag: (props) => ({card: props.card})
    , canDrag: (props, monitor) => !props.disabled
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , connectDragPreview: connect.dragPreview()
    , isDragging: monitor.isDragging()
  })
)(Card);