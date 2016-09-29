import React from 'react';

import {Continent} from './Continent.jsx'
import {DropTargetAnimal} from './Animal.jsx';

export class ContinentFeeding extends Continent {
  componentWillMount() {
    this.$traitTakeFood = (animal) => this.context.gameActions.$traitTakeFood(animal.id);
    this.$traitActivate = this.context.gameActions.$traitActivate;
  }

  renderPlaceholderWrapper() {
    return null;
  }

  renderAnimal(animal, index) {
    return <DropTargetAnimal
      key={animal.id}
      index={index}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onTraitDropped={this.$traitActivate}
      onFoodDropped={this.$traitTakeFood} />
  }
}