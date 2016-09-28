import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';

import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';
import { AnimalTrait, DragAnimalTrait } from './AnimalTrait.jsx';

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
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {model, connectDropTarget, isOver} = this.props;

    const className = classnames({
      Animal: true
      , highlight: isOver
    });

    const body = <div className={className}>
      <div className='traits'>
        {model.traits.map((trait, index) => (
          trait.dataModel.targetType
            ? <DragAnimalTrait key={index} index={index} trait={trait}/>
            : <AnimalTrait key={index} index={index} trait={trait}/>)
          )}
      </div>
      <div className='inner'>
        {model.base && model.base.name}
        <div className='food'>
          {Array.from({length: model.food}).map((u, index) => <div className='AnimalFood'></div>)}
        </div>
      </div>
    </div>;
    return connectDropTarget ? connectDropTarget(body) : body;
  }
}

export const DropTargetAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT], {
  drop(props, monitor, component) {
    const {item} = monitor.getItem();
    if (monitor.getItemType() === DND_ITEM_TYPE.CARD) {
      props.onCardDropped(item, props.model);
    }
    /* else if (monitor.getItemType() === ITEM_TYPE.FOOD) {
     props.onFoodDropped(props.model);
     }*/
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Animal);