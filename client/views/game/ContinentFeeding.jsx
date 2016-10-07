import React from 'react';

import {Continent} from './Continent.jsx'
import {DroppableAnimal} from './Animal.jsx';

export class ContinentFeeding extends Continent {
  componentWillMount() {
    this.$traitTakeFood = (animal) => this.context.gameActions.$traitTakeFood(animal.id);
    this.$traitActivate = this.context.gameActions.$traitActivate;
  }

  renderPlaceholderWrapper() {
    return null;
  }

  renderAnimal(animal, index) {
    return <DroppableAnimal
      key={animal.id}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onTraitDropped={this.$traitActivate}
      onFoodDropped={this.$traitTakeFood} />
  }
}