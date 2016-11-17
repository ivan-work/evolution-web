import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import { DropTarget } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';
import { TraitModel } from '~/shared/models/game/evolution/TraitModel';
import {ActionCheckError} from '~/shared/models/ActionCheckError';

import { AnimalTrait, DragAnimalTrait, ANIMAL_TRAIT_SIZE } from './AnimalTrait.jsx';
import { AnimalLinkedTrait } from './AnimalLinkedTrait.jsx';
import { DragAnimalSelectLink } from './AnimalSelectLink.jsx'
import {GameProvider} from './../providers/GameProvider.jsx';
import {Food} from './../food/Food.jsx';

class Animal extends React.Component {
  //static displayName = 'Animal';

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
  };

  constructor(props) {
    super(props);
    this.state = {};
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  renderSelectLink() {
    if (this.state.selectLink) {
      return <DragAnimalSelectLink onEndDrag={() => this.setState({selectLink: null})} {...this.state.selectLink}/>;
    }
  }

  renderTrait(trait, animal) {
    if (trait.isLinked()) {
      return <AnimalLinkedTrait trait={trait} sourceAnimalId={animal.id}/>;
    } else if (trait.dataModel.targetType) {
      return <DragAnimalTrait trait={trait} sourceAnimal={animal}/>;
    } else {
      return <AnimalTrait trait={trait} sourceAnimal={animal}/>;
    }
  }

  render() {
    const {model, connectDropTarget, isOver, canDrop} = this.props;

    const className = classnames({
      Animal: true
      , highlight: isOver && canDrop
    });

    let traitHeight = 0;

    return (<div className={className}>
      <div className='traits'>
        {model.traits
          .sort((t1, t2) => t1.isLinked() ? 1 : -1)
          .toArray()
          .map((trait, index) =>{
          if (!trait.isLinked()) {
            traitHeight -= ANIMAL_TRAIT_SIZE.height;
            }
          return <div key={index}
                      style={{
            position: 'absolute'
            , top: traitHeight + 'px'
            , width: ANIMAL_TRAIT_SIZE.width + 'px'
            }}>
            {this.renderTrait(trait, model)}
          </div>})}
      </div>
      {this.renderSelectLink()}
      <div className='inner'>
        {model.id}
        <div className='AnimalFoodContainer'>
          {Array.from({length: model.food}).map((u, index) => <Food key={index}/>)}
        </div>
      </div>
    </div>);
  }
}


class DropAnimal_Body extends Animal {
  render() {
    return this.props.connectDropTarget(super.render());
  }
}
DropAnimal_Body.displayName = 'Animal';
DropAnimal_Body.propTypes = {
  connectDropTarget: PropTypes.func.isRequired
  , isOver: PropTypes.bool.isRequired
  , canDrop: PropTypes.bool.isRequired
};

const DropAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.ANIMAL_LINK], {
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
      {

        const {trait, sourceAnimal} = monitor.getItem();
        props.onTraitDropped(sourceAnimal.id, trait.type, props.model.id);
        break;
      }
      case DND_ITEM_TYPE.ANIMAL_LINK:
      {
        const {model: targetAnimal} = props;
        const {animal: sourceAnimal} = monitor.getItem();
        props.onAnimalLink(monitor.getItem().card, sourceAnimal, monitor.getItem().alternateTrait, targetAnimal);
        break;
      }
    }
  }
  , canDrop(props, monitor) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        return true;
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        return props.isUserAnimal && props.model.canEat(props.game);
      case DND_ITEM_TYPE.TRAIT:
      {
        const {trait, sourceAnimal} = monitor.getItem();
        const targetCheck = !trait.dataModel.checkTarget || trait.dataModel.checkTarget(props.game, sourceAnimal, props.model);
        return sourceAnimal.id !== props.model.id && targetCheck;
      }
      case DND_ITEM_TYPE.ANIMAL_LINK:
      {
        const {model: targetAnimal} = props;
        const {card, animal: sourceAnimal, alternateTrait} = monitor.getItem();
        if (card && targetAnimal) {
          return !TraitModel.LinkBetweenCheck(card.getTraitDataModel(alternateTrait).type, sourceAnimal, targetAnimal);
        }
        return targetAnimal !== sourceAnimal
          && targetAnimal.ownerId === sourceAnimal.ownerId;
      }
      default:
        return true;
    }
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(DropAnimal_Body);

DropAnimal.propTypes = {
  // by GameProvider
  game: PropTypes.object.isRequired
};

const GameDropAnimal = GameProvider(DropAnimal);

export {Animal
  , DropAnimal as _DropAnimal
  , GameDropAnimal as DropAnimal};