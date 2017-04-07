import React from 'react';

import {Continent} from './Continent.jsx'
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DroppableAnimal} from './Animal.jsx';

import * as MDL from 'react-mdl';
import {Dialog, DialogActions} from '../utils/Dialog.jsx';

export class ContinentDeploy extends Continent {
  componentWillMount() {
    this.$deployAnimal = (card, zoneIndex) => this.context.gameActions.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal, alternateTrait) => {
      this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait);
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
    return <DroppableAnimal
      key={animal.id}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onCardDropped={this.$deployTrait}/>
  }
}