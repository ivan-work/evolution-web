import React from 'react';
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom';
import T from 'i18n-react';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent (clickEvent);
}

class AnimalSelectLink extends React.PureComponent {
  static propTypes = {
    // by DragSource
    connectDragSource: PropTypes.func
    , isDragging: PropTypes.bool
    , canDrag: PropTypes.bool
    // self
    , onEndDrag: PropTypes.func.isRequired
    , card: PropTypes.object
    , animal: PropTypes.object
    , alternateTrait: PropTypes.bool
  };

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

    return connectDragSource(<div className="SelectLink pointer">{T.translate('Game.UI.SelectLink')}</div>);
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