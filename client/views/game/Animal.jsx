import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';
import { AnimalTrait, DraggableAnimalTrait } from './AnimalTrait.jsx';

export class Animal extends React.Component {
  static defaultProps = {
    isUserAnimal: false
  };

  static propTypes = {
    model: React.PropTypes.instanceOf(AnimalModel).isRequired
    , isUserAnimal: React.PropTypes.bool
    , onCardDropped: React.PropTypes.func
    , onFoodDropped: React.PropTypes.func
    , onTraitDropped: React.PropTypes.func
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
            ? <DraggableAnimalTrait key={index} index={index} trait={trait} owner={model}/>
            : <AnimalTrait key={index} index={index} trait={trait} owner={model}/>)
          )}
      </div>
      <div className='inner'>
        {model.id}
        <div className='food'>
          {Array.from({length: model.food}).map((u, index) => <div key={index} className='AnimalFood'></div>)}
        </div>
      </div>
    </div>;
    return connectDropTarget ? connectDropTarget(body) : body;
  }
}

export const DropTargetAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT], {
  drop(props, monitor, component) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        const {card} = monitor.getItem();
        props.onCardDropped(card, props.model);
        break;
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        props.onFoodDropped(props.model, index);
        break;
      case DND_ITEM_TYPE.TRAIT:
        const {trait, owner} = monitor.getItem();
        props.onTraitDropped(owner.id, trait.type, props.model.id);
        break;
    }
  }
  , canDrop(props, monitor) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        return true;
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        return props.isUserAnimal && props.model.canEat();
      case DND_ITEM_TYPE.TRAIT:
        const {trait, owner} = monitor.getItem();
        const targetCheck = !trait.dataModel.checkTarget || trait.dataModel.checkTarget(props.game, owner, props.model);
        return owner.id !== props.model.id && targetCheck;
      default:
        return true;
    }
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Animal);