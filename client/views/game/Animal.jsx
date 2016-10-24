import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';
import { TraitModel } from '~/shared/models/game/evolution/TraitModel';
import {ActionCheckError} from '~/shared/models/ActionCheckError';

import { AnimalTrait, DraggableAnimalTrait } from './AnimalTrait.jsx';
import { AnimalLinkedTrait } from './AnimalLinkedTrait.jsx';
import { AnimalSelectLink } from './AnimalSelectLink.jsx'
import {GameProvider} from './providers/GameProvider.jsx';
import {Food} from './Food.jsx';

export class _Animal extends React.Component {
  static displayName = 'Animal';

  static defaultProps = {
    isUserAnimal: false
  };

  static propTypes = {
    model: React.PropTypes.instanceOf(AnimalModel).isRequired
    , isUserAnimal: React.PropTypes.bool
    , onCardDropped: React.PropTypes.func
    , onFoodDropped: React.PropTypes.func
    , onTraitDropped: React.PropTypes.func
    , onAnimalLink: React.PropTypes.func
    // by DropTarget
    , connectDropTarget: React.PropTypes.func
    , isOver: React.PropTypes.bool
    , canDrop: React.PropTypes.bool
    // by GameProvider
    , game: React.PropTypes.object
    , isPlayerTurn: React.PropTypes.bool
    , currentUserId: React.PropTypes.string
    , isDeploy: React.PropTypes.bool
    , isFeeding: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {};
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  renderSelectLink() {
    if (this.state.selectLink) {
      return <AnimalSelectLink onEndDrag={() => this.setState({selectLink: null})} {...this.state.selectLink}/>;
    }
  }

  render() {
    const {model, connectDropTarget, isOver, canDrop} = this.props;

    const className = classnames({
      Animal: true
      , highlight: isOver && canDrop
    });

    const body = <div className={className}>
        {model.traits
          .toArray()
          .filter(trait => trait.isLinked())
          .map((trait, index) => <AnimalLinkedTrait key={index} trait={trait} sourceAnimalId={model.id}/>)}
      <div className='traits'>
        {model.traits
          .toArray()
          .filter(trait => !trait.isLinked())
          .map((trait, index) => (
          trait.dataModel.targetType
            ? <DraggableAnimalTrait key={index} index={index} trait={trait} owner={model}/>
            : <AnimalTrait key={index} index={index} trait={trait} owner={model}/>)
          )}
      </div>
      {this.renderSelectLink()}
      <div className='inner'>
        {model.id}
        <div className='AnimalFoodContainer'>
          {Array.from({length: model.food}).map((u, index) => <Food key={index}/>)}
        </div>
      </div>
    </div>;
    return connectDropTarget ? connectDropTarget(body) : body;
  }
}

const _DroppableAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.ANIMAL_LINK], {
  drop(props, monitor, component) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        const {card, alternateTrait} = monitor.getItem();
        props.onCardDropped(card, props.model, alternateTrait, component);
        break;
      case DND_ITEM_TYPE.FOOD:
      const {index} = monitor.getItem();
        props.onFoodDropped(props.model, index);
        break;
      case DND_ITEM_TYPE.TRAIT:
        const {trait, owner} = monitor.getItem();
        props.onTraitDropped(owner.id, trait.type, props.model.id);
        break;
      case DND_ITEM_TYPE.ANIMAL_LINK:
        const {model: targetAnimal} = props;
        const {animal: sourceAnimal} = monitor.getItem();
        props.onAnimalLink(monitor.getItem().card, sourceAnimal, monitor.getItem().alternateTrait, targetAnimal);
        break;
    }
  }
  , canDrop(props, monitor) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        return true;
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        return props.isUserAnimal && props.model.needsFood() > 0;
      case DND_ITEM_TYPE.TRAIT:
        const {trait, owner} = monitor.getItem();
        const targetCheck = !trait.dataModel.checkTarget || trait.dataModel.checkTarget(props.game, owner, props.model);
        return owner.id !== props.model.id && targetCheck;
      case DND_ITEM_TYPE.ANIMAL_LINK:
        const {model: targetAnimal} = props;
        const {card, animal: sourceAnimal, alternateTrait} = monitor.getItem();
        if (card && targetAnimal) {
          try {
            TraitModel.new(card.getTraitDataModel(alternateTrait).type).linkBetween(sourceAnimal, targetAnimal)
          } catch (e) {
            if (e instanceof ActionCheckError) {
              return false;
            } else {
              throw e;
            }
          }
        }
        return targetAnimal !== sourceAnimal
          && targetAnimal.ownerId === sourceAnimal.ownerId;
      default:
        return true;
    }
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(_Animal);

export const DroppableAnimal = GameProvider(_DroppableAnimal);
export const Animal = _Animal;