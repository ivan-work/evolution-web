import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';

import {DropTarget} from 'react-dnd';
import {DND_ITEM_TYPE} from '../../game/dnd/DND_ITEM_TYPE';

import {gameDeployAnimalRequest} from '../../../../shared/actions/actions';

export class ContinentZone extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired
  };

  componentDidMount() {
    this.className = 'ContinentZone'
  }

  componentWillReceiveProps({isOver}) {
    this.className = classnames({
      ContinentZone: true
      , highlight: isOver
    });
  }

  render() {
    return this.props.connectDropTarget(<div className={this.className}>
      <div className="inner"/>
    </div>);
  }
}

export default compose(connect(() => ({})
  , (dispatch) => ({
    $deployAnimal: (...args) => dispatch(gameDeployAnimalRequest(...args))
  }))
  , DropTarget(DND_ITEM_TYPE.CARD, {
    drop({index, $deployAnimal}, monitor, component) {
      const {card} = monitor.getItem();
      $deployAnimal(card.id, index);
    }
  }, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  }))
)(ContinentZone)