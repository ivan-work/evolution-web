import React from 'react';

import {Continent} from './Continent.jsx'
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

export class ContinentDeploy extends Continent {
  componentWillMount() {
    this.$deployAnimal = (card, zoneIndex) => this.context.gameActions.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal) => this.context.gameActions.$deployTrait(card.id, animal.id);
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
    return <DropTargetAnimal
      key={animal.id}
      index={index}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onCardDropped={this.$deployTrait}/>
  }
}