import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';

export class Food extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired
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
    const {index, disabled, connectDragSource, isDragging} = this.props;

    const className = classnames({
      Food: true
      , disabled: disabled
      , enabled: !disabled
      , isDragging: isDragging
    });

    const body = <div className={className}></div>;

    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragFood = DragSource(DND_ITEM_TYPE.FOOD
  , {
    beginDrag: (props) => ({index: props.index})
    , canDrag: (props, monitor) => !props.disabled
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
  })
)(Food);