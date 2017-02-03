import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import {Icon} from 'react-mdl';

import {DropTarget} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';


import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {TRAIT_ANIMAL_FLAG, TRAIT_TARGET_TYPE} from '../../../../shared/models/game/evolution/constants';

import {Tooltip} from './../../utils/Tooltips.jsx';
import AnimalTraitDetails from './AnimalTraitDetails.jsx';
import {AnimalTrait, DragAnimalTrait, ClickAnimalTrait} from './AnimalTrait.jsx';
import {AnimalLinkedTrait} from './AnimalLinkedTrait.jsx';
import {DragAnimalSelectLink} from './AnimalSelectLink.jsx'
import {GameProvider} from './../providers/GameProvider.jsx';
import {Food} from './../food/Food.jsx';

import './Animal.scss';

class Animal extends React.Component {
  static propTypes = {
    model: React.PropTypes.instanceOf(AnimalModel).isRequired
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
    return <AnimalTrait trait={trait}/>;
  }

  renderFoodStatus(animal) {
    return (animal.isFull() ? <Icon name='sentiment_very_satisfied'/>
      : !animal.canSurvive() ? <Icon name='sentiment_very_dissatisfied'/>
      : <Icon name='sentiment_neutral'/>);
  }

  render() {
    const {model, isOver, canDrop} = this.props;

    const className = classnames({
      Animal: true
      , highlight: isOver && canDrop
    });

    return (<div id={'Animal' + model.id} className={className}>
      <div className='traits'>
        {model.traits
          .reverse()
          //.sort((t1, t2) => t1.isLinked() ? 1 : -1)
          .map((trait, index) =>
          (<div key={trait.id}
                style={{marginBottom: '-5px'}}>
            {this.renderTrait(trait, model)}
          </div>))}
      </div>
      {this.renderSelectLink()}
      <div id={'AnimalBody'+model.id} className='inner'>
        {this.renderFoodStatus(model)}
        {model.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) ?
        <span className='material-icons Flag Poisoned'>smoking_rooms</span> : null}
        {model.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) ?
        <span className='material-icons Flag Hibernated'>snooze</span> : null}
        <div className='AnimalFoodContainer'>
          {Array.from({length: model.food}).map((u, index) => <Food key={index}/>)}
        </div>
      </div>
    </div>);
  }
}

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
        props.onTraitDropped(sourceAnimal, trait, props.model.id);
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
        const targetCheck = !trait.getDataModel().checkTarget || trait.getDataModel().checkTarget(props.game, sourceAnimal, props.model);
        return sourceAnimal.id !== props.model.id && targetCheck;
      }
      case DND_ITEM_TYPE.ANIMAL_LINK:
      {
        const {model: targetAnimal} = props;
        const {card, animal: sourceAnimal, alternateTrait} = monitor.getItem();
        if (card && targetAnimal) {
          return !TraitModel.LinkBetweenCheck(!alternateTrait ? card.trait1 : card.trait2, sourceAnimal, targetAnimal);
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
}))(class extends Animal {
    static displayName = 'Animal';
    static propTypes = {
      // by GameProvider
      game: PropTypes.object.isRequired
      // by DnD
      , connectDropTarget: PropTypes.func.isRequired
      , isOver: PropTypes.bool.isRequired
      , canDrop: PropTypes.bool.isRequired
      // by direct
      , isUserAnimal: React.PropTypes.bool
      , onCardDropped: React.PropTypes.func.isRequired
      , onFoodDropped: React.PropTypes.func.isRequired
      , onTraitDropped: React.PropTypes.func.isRequired
      , onAnimalLink: React.PropTypes.func.isRequired
    };

    renderTrait(trait, animal) {
      if (trait.isLinked()) {
        return <AnimalLinkedTrait trait={trait} sourceAnimal={animal}/>;
      } else if (trait.getDataModel().playerControllable && trait.getDataModel().targetType === TRAIT_TARGET_TYPE.ANIMAL) {
        return <DragAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}/>;
      } else if (trait.getDataModel().playerControllable) {
        return <ClickAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}
                                 onClick={() => this.props.onTraitDropped(animal, trait)}/>;
      } else {
        return <AnimalTrait trait={trait}/>;
      }
    }

    render() {
      return this.props.connectDropTarget(super.render());
    }
  }
);

const GameDropAnimal = GameProvider(DropAnimal);

export {
  Animal
  , DropAnimal as _DropAnimal
  , GameDropAnimal as DropAnimal
};