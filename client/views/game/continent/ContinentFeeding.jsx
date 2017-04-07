import React from 'react';

import {Continent} from './Continent.jsx'
import {DropAnimal} from '../animals/Animal.jsx';

export class ContinentFeeding extends Continent {
  getClassName() {
    return 'ContinentFeeding';
  }

  componentWillMount() {
    this.$traitTakeFood = (animal) => this.context.gameActions.$traitTakeFood(animal.id);
    this.$traitActivate = this.context.gameActions.$traitActivate;
  }

  renderPlaceholderWrapper() {
    return null;
  }

  renderAnimal(animal, index) {
    return <DropAnimal
      key={animal.id}
      model={animal}
      isUserAnimal={this.props.isUserContinent}
      onTraitDropped={this.$traitActivate}
      onFoodDropped={this.$traitTakeFood}/>
  }
}