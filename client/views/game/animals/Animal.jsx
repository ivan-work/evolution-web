import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';
import {Icon} from 'react-mdl';

import {DropTarget} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';


import {PHASE} from '../../../../shared/models/game/GameModel';
import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {TRAIT_ANIMAL_FLAG, TRAIT_TARGET_TYPE} from '../../../../shared/models/game/evolution/constants';

import {AnimalTrait, DragAnimalTrait, ClickAnimalTrait} from './AnimalTrait.jsx';
import {AnimalLinkedTrait} from './AnimalLinkedTrait.jsx';
import {DragAnimalSelectLink} from './AnimalSelectLink.jsx'
import {Food} from './../food/Food.jsx';

import '../animals/Animal.scss';
import Tooltip from '../../utils/Tooltip.jsx';

class Animal extends React.Component {
  static propTypes = {
    model: PropTypes.instanceOf(AnimalModel).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
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
      : animal.canSurvive() ? <Icon name='sentiment_neutral'/>
        : <Icon name='sentiment_very_dissatisfied'/>);
  }

  render() {
    const {model, children, isOver, canDrop, game} = this.props;

    const className = classnames({
      Animal: true
      , highlight: isOver && canDrop
    });

    return (<div id={'Animal' + model.id} className={className}>
      <div className='traits'>
        {!children && model.traits
          .toList()
          .reverse()
          //.sort((t1, t2) => t1.isLinked() ? 1 : -1)
          .map((trait, index) =>
            (<div key={trait.id}>
              {this.renderTrait(trait, model)}
            </div>))}
        {!!children && children}
      </div>
      {this.renderSelectLink()}
      {!game && this.renderAnimalBody(model, game)}
      {!!game && <Tooltip
        overlay={<Animal model={model}/>}>
        {this.renderAnimalBody(model, game)}
      </Tooltip>}
    </div>);
  }

  renderAnimalBody(animal, game) {
    return (<div id={'AnimalBody' + animal.id} className='inner'>
      {game && game.status.phase === PHASE.FEEDING && this.renderFoodStatus(animal, game)}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) && <span className='material-icons Flag Poisoned'>smoking_rooms</span>}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && <span className='material-icons Flag Hibernated'>snooze</span>}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && <span className='material-icons Flag Shell'>home</span>}
      {animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION) && <span className='material-icons Flag Regeneration'>get_app</span>}
      <div className='AnimalFoodContainer'>
        {Array.from({length: animal.food}).map((u, index) => <Food key={index}/>)}
      </div>
    </div>);
  }
}

const DropAnimal = DropTarget([DND_ITEM_TYPE.CARD, DND_ITEM_TYPE.FOOD, DND_ITEM_TYPE.TRAIT, DND_ITEM_TYPE.TRAIT_SHELL, DND_ITEM_TYPE.ANIMAL_LINK], {
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
      case DND_ITEM_TYPE.TRAIT: {
        const {trait, sourceAnimal} = monitor.getItem();
        props.onTraitDropped(sourceAnimal, trait, props.model.id);
        break;
      }
      case DND_ITEM_TYPE.TRAIT_SHELL: {
        const {model: animal} = props;
        const {trait} = monitor.getItem();
        props.onTraitShellDropped(animal, trait);
        break;
      }
      case DND_ITEM_TYPE.ANIMAL_LINK: {
        const {model: targetAnimal} = props;
        const {animal: sourceAnimal} = monitor.getItem();
        props.onAnimalLink(monitor.getItem().card, sourceAnimal, monitor.getItem().alternateTrait, targetAnimal);
        break;
      }
    }
  }
  , canDrop(props, monitor) {
    switch (monitor.getItemType()) {
      case DND_ITEM_TYPE.CARD: {
        const {game, model: animal} = props;
        switch (game.status.phase) {
          case PHASE.DEPLOY:
            const {card, alternateTrait} = monitor.getItem();
            const traitData = card.getTraitDataModel(alternateTrait);
            return !traitData.checkTraitPlacementFails(animal);
          case PHASE.REGENERATION:
            return animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION);
          default:
            return false;
        }
      }
      case DND_ITEM_TYPE.FOOD:
        const {index} = monitor.getItem();
        return props.isUserAnimal && props.model.canEat(props.game);
      case DND_ITEM_TYPE.TRAIT: {
        const {trait, sourceAnimal} = monitor.getItem();
        const targetCheck = !trait.getDataModel().checkTarget || trait.getDataModel().checkTarget(props.game, sourceAnimal, props.model);
        return sourceAnimal.id !== props.model.id && targetCheck;
      }
      case DND_ITEM_TYPE.TRAIT_SHELL: {
        const {model: animal} = props;
        const {trait} = monitor.getItem();
        return !trait.getDataModel().checkTraitPlacementFails(animal);
      }
      case DND_ITEM_TYPE.ANIMAL_LINK: {
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
      game: PropTypes.object.isRequired
      // by DnD
      , connectDropTarget: PropTypes.func.isRequired
      , isOver: PropTypes.bool.isRequired
      , canDrop: PropTypes.bool.isRequired
      // by direct
      , isUserAnimal: PropTypes.bool
      , onCardDropped: PropTypes.func.isRequired
      , onFoodDropped: PropTypes.func.isRequired
      , onTraitDropped: PropTypes.func.isRequired
      , onTraitShellDropped: PropTypes.func.isRequired
      , onAnimalLink: PropTypes.func.isRequired
    };

    renderTrait(trait, animal) {
      if (trait.isLinked()) {
        if (trait.getDataModel().playerControllable) {
          return <AnimalLinkedTrait trait={trait} sourceAnimal={animal}>
            <ClickAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}
                              onClick={() => this.props.onTraitDropped(animal, trait)}/>
          </AnimalLinkedTrait>
        } else {
          return <AnimalLinkedTrait trait={trait} sourceAnimal={animal}>
            <AnimalTrait trait={trait}/>
          </AnimalLinkedTrait>
        }
      } else if (trait.getDataModel().playerControllable && trait.getDataModel().targetType === TRAIT_TARGET_TYPE.ANIMAL) {
        return <DragAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}/>;
      } else if (trait.getDataModel().playerControllable || trait.type === 'TraitAmbush') {
        return <ClickAnimalTrait trait={trait} game={this.props.game} sourceAnimal={animal}
                                 onClick={() => this.props.onTraitDropped(animal, trait, this.props.game)}/>;
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
  Animal
  , DropAnimal
};