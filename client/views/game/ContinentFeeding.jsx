import React from 'react';

import {Continent} from './Continent.jsx'
import {DropTargetAnimal} from './Animal.jsx';

export class ContinentFeeding extends Continent {
  componentWillMount() {
    this.$traitTakeFood = (animal) => this.context.gameActions.$traitTakeFood(animal.id);
    this.$traitActivate = (source, trait, target) => this.context.gameActions.$traitActivate(source.id, trait.type, target.id);
  }

  renderPlaceholderWrapper() {
    return null;
  }

  renderAnimal(animal, index) {
    return <DropTargetAnimal
      key={animal.id}
      index={index}
      model={animal}
      onCardDropped={this.$traitActivate}
      onFoodDropped={this.$traitTakeFood} />
  }
}