import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';
import { DropTarget } from 'react-dnd';

export const ANIMAL_SIZE = {
  width: 60
  , height: 80
};

export class Animal extends React.Component {
  static defaultProps = {
    model: {name: 'default animal', base: {name: 'default card'}}
  };

  static propTypes = {
    model: React.PropTypes.instanceOf(AnimalModel).isRequired
    , index: React.PropTypes.number.isRequired
    , onOver: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {index, model, connectDropTarget, isOver} = this.props;

    const body = <div className='Animal' style={ANIMAL_SIZE}>
      <div className='inner'>
        {index}{isOver ? 'ITS OVER' : ''}
        <br/>{model && model.base && model.base.name}
      </div>
    </div>;
    return connectDropTarget ? connectDropTarget(body) : body;
  }
}

export const DropTargetAnimal = DropTarget("Card", {
  drop(props, monitor, component) {
    const {card} = monitor.getItem();
    props.onCardDropped(card, props.model);
  }
  , hover(props, monitor, component) {
    props.onOver(monitor.isOver({shallow: true}), props.index);
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Animal);