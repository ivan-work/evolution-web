import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';
import {Icon} from 'react-mdl';

import {DropTarget} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';


import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {TRAIT_ANIMAL_FLAG, TRAIT_TARGET_TYPE} from '../../../../shared/models/game/evolution/constants';

import {AnimalTrait, DragAnimalTrait, ClickAnimalTrait} from './AnimalTrait.jsx';
import {AnimalLinkedTrait} from './AnimalLinkedTrait.jsx';
import {DragAnimalSelectLink} from './AnimalSelectLink.jsx'
import {GameProvider} from './../providers/GameProvider.jsx';
import {Food} from './../food/Food.jsx';

import './RoundAnimal.scss';
import Tooltip from '../../utils/Tooltip.jsx';

class RoundAnimal extends React.Component {
  static propTypes = {
    animal: React.PropTypes.instanceOf(AnimalModel).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getClassNames() {
    return {RoundAnimal: true}
  }

  renderTrait(trait, animal) {
    return <AnimalTrait trait={trait}/>;
  }

  renderFoodStatus(animal) {
    return (animal.isFull() ? <Icon name='sentiment_very_satisfied'/>
      : animal.canSurvive() ? <Icon name='sentiment_neutral'/>
      : <Icon name='sentiment_very_dissatisfied'/>);
  }

  render() {
    const animal = this.props.animal;

    const className = classnames(this.getClassNames());

    return (<div id={'Animal' + animal.id} className={className}>
      <div className='traits'>
        {animal.traits
          .reverse()
          //.sort((t1, t2) => t1.isLinked() ? 1 : -1)
          .map((trait, index) =>
            (<div key={trait.id}
                  style={{marginBottom: '-5px'}}>
              {this.renderTrait(trait, animal)}
            </div>))}
      </div>
      {this.renderAnimalBody()}
    </div>);
  }

  renderAnimalBody() {
    const {animal, game} = this.props;
    return (<div id={'AnimalBody' + animal.id} className='RoundAnimalBody'>
      {game && game.isFeeding() && this.renderFoodStatus(animal, game)}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) &&
      <span className='material-icons Flag Poisoned'>smoking_rooms</span>}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && <span className='material-icons Flag Hibernated'>snooze</span>}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && <span className='material-icons Flag Shell'>lock</span>}
      <div className='AnimalFoodContainer'>
        {Array.from({length: animal.food}).map((u, index) => <Food key={index}/>)}
      </div>
    </div>);
  }
}

const DropRoundAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.TRAIT_SHELL, DND_ITEM_TYPE.ANIMAL_LINK], {
  drop(props, monitor, component) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD:
        const {card, alternateTrait} = monitor.getItem();
        props.onCardDropped(card, props.animal, alternateTrait, component);
        break;
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        props.onFoodDropped(props.animal, index);
        break;
      case DND_ITEM_TYPE.TRAIT: {
        const {trait, sourceAnimal} = monitor.getItem();
        props.onTraitDropped(sourceAnimal, trait, props.animal.id);
        break;
      }
      case DND_ITEM_TYPE.TRAIT_SHELL: {
        const {animal} = props;
        const {trait} = monitor.getItem();
        props.onTraitShellDropped(animal, trait);
        break;
      }
      case DND_ITEM_TYPE.ANIMAL_LINK: {
        const {animal: targetAnimal} = props;
        const {animal: sourceAnimal} = monitor.getItem();
        props.onAnimalLink(monitor.getItem().card, sourceAnimal, monitor.getItem().alternateTrait, targetAnimal);
        break;
      }
    }
  }
  , canDrop(props, monitor) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD: {
        const {animal} = props;
        const {card, alternateTrait} = monitor.getItem();
        const traitData = card.getTraitDataModel(alternateTrait);
        return !card.getTraitDataModel(alternateTrait).hidden

          && (!traitData.checkTraitPlacement || traitData.checkTraitPlacement(animal));
      }
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        return props.game.userId === props.animal.ownerId && props.animal.canEat(props.game);
      case DND_ITEM_TYPE.TRAIT: {
        const {trait, sourceAnimal} = monitor.getItem();
        const targetCheck = !trait.getDataModel().checkTarget || trait.getDataModel().checkTarget(props.game, sourceAnimal, props.animal);
        return sourceAnimal.id !== props.animal.id && targetCheck;
      }
      case DND_ITEM_TYPE.TRAIT_SHELL: {
        const {animal} = props;
        const {trait} = monitor.getItem();
        return trait.checkAttach(animal);
      }
      case DND_ITEM_TYPE.ANIMAL_LINK: {
        const {animal: targetAnimal} = props;
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
}))(class extends RoundAnimal {
    static displayName = 'Animal';
    static propTypes = {
      // by GameProvider
      game: React.PropTypes.object.isRequired
      // by DnD
      , connectDropTarget: React.PropTypes.func.isRequired
      , isOver: React.PropTypes.bool.isRequired
      , canDrop: React.PropTypes.bool.isRequired
      // by direct
      // , onCardDropped: React.PropTypes.func.isRequired
      // , onFoodDropped: React.PropTypes.func.isRequired
      // , onTraitDropped: React.PropTypes.func.isRequired
      // , onTraitShellDropped: React.PropTypes.func.isRequired
      // , onAnimalLink: React.PropTypes.func.isRequired
    };

    getClassNames() {
      const {isOver, canDrop} = this.props;
      return Object.assign(super.getClassNames(), {
        highlight: isOver && canDrop
      })
    }

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

export {
  RoundAnimal
  , DropRoundAnimal
};