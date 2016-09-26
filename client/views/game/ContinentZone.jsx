import React from 'react';
import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import { DropTarget } from 'react-dnd';

export class ContinentZone extends React.Component {
  static propTypes = {
    width: React.PropTypes.string.isRequired
    , index: React.PropTypes.number.isRequired
    , onCardDropped: React.PropTypes.func.isRequired
    , onOver: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // @HACK for mouse leave
    if (this.props.isOver && !nextProps.isOver) {
      nextProps.onOver(nextProps.isOver, nextProps.index);
    }
  }

  render() {
    const {width, isOver} = this.props;
    return this.props.connectDropTarget(<div className={classnames({
      ContinentZone: true
      , highlight: isOver
    })} style={{width}}>
    </div>);
  }
}

export const DropTargetContinentZone = DropTarget("Card", {
  drop(props, monitor, component) {
    const {card} = monitor.getItem();
    props.onCardDropped(card, props.index);
  }
  , hover(props, monitor, component) {
    props.onOver(monitor.isOver({shallow: true}), props.index);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(ContinentZone);