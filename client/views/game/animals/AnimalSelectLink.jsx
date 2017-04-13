import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent (clickEvent);
}

class AnimalSelectLink extends React.Component {
  static propTypes = {
    // by DragSource
    connectDragSource: React.PropTypes.func
    , isDragging: React.PropTypes.bool
    , canDrag: React.PropTypes.bool
    // self
    , onEndDrag: React.PropTypes.func.isRequired
    , card: React.PropTypes.object
    , animal: React.PropTypes.object
    , alternateTrait: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    setTimeout(() => {
      triggerMouseEvent(node, 'mousedown');
    }, 0);
  }

  render() {
    const {connectDragSource} = this.props;

    //const className = classnames({
    //  AnimalTrait: true
    //  , canDrag
    //  , isDragging
    //  , draggable: connectDragSource
    //});

    return connectDragSource(<div className="SelectLink">{T.translate('Game.UI.SelectLink')}</div>);
  }
}

export const DragAnimalSelectLink = DragSource(DND_ITEM_TYPE.ANIMAL_LINK
  , {
    beginDrag: (props) => {
      const {card, animal, alternateTrait} = props;
      return {card, animal, alternateTrait};
    }
    , endDrag: (props, monitor, component) => {
      props.onEndDrag();
    }
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
  })
)(AnimalSelectLink);