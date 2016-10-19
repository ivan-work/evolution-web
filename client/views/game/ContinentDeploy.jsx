import React from 'react';
import ReactDOM from 'react-dom';

import {CTT_PARAMETER} from '../../../shared/models/game/evolution/constants';

import {Continent} from './Continent.jsx'
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DroppableAnimal} from './Animal.jsx';

import * as MDL from 'react-mdl';
import {Dialog, DialogActions} from '../utils/Dialog.jsx';

export class ContinentDeploy extends Continent {
  static contextTypes = {
    game: React.PropTypes.object
    , gameWrapper: React.PropTypes.object
  };
  componentWillMount() {
    const backend = this._reactInternalInstance._currentElement._owner._currentElement._owner._currentElement._owner._currentElement._owner
      ._currentElement._owner._instance.getManager().getBackend()

    console.log(backend);
    this.$deployAnimal = (card, zoneIndex) => this.context.gameActions.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal, alternateTrait) => {
      if (card.trait1.cardTargetType & CTT_PARAMETER.LINK) {
        const $el = document.getElementById(card.id);
        //console.log($($el))
        //$Game0.get(0).getManager().getBackend()
      } else {
        this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait);
      }
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