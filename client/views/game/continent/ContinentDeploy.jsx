import React from 'react';
import ReactDOM from 'react-dom';

import {CTT_PARAMETER} from '../../../../shared/models/game/evolution/constants';

import {Continent} from './Continent.jsx'
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {GameDroppableAnimal} from '../Animal.jsx';

import * as MDL from 'react-mdl';
import {Dialog, DialogActions} from '../../utils/Dialog.jsx';

export class ContinentDeploy extends Continent {
  getClassName() {
    return 'ContinentDeploy';
  }

  componentWillMount() {
    this.$deployAnimal = (card, zoneIndex) => this.context.gameActions.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal, alternateTrait, component) => {
      console.log('Continent$deployTrait')
      if (card.getTraitDataModel(alternateTrait).cardTargetType & CTT_PARAMETER.LINK) {
        component.setState({selectLink: {card, animal, alternateTrait}});
      } else {
        this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait);
      }
    };
    this.$deployLinkedTrait = (card, animal, alternateTrait, linkedAnimal) => {
      this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait, linkedAnimal.id);
    }
  }

  renderPlaceholderWrapper(index) {
    return !this.props.isUserContinent
      ? null
      : <DropTargetContinentZone
      key={index}
      index={index}
      onCardDropped={this.$deployAnimal}>
    </DropTargetContinentZone>
  }

  renderAnimal(animal, index) {
    return <GameDroppableAnimal
      key={animal.id}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onAnimalLink={this.$deployLinkedTrait}
      onCardDropped={this.$deployTrait}/>
  }
}