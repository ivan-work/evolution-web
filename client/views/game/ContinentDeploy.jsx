import React from 'react';

import {Continent} from './Continent.jsx'
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DroppableAnimal} from './Animal.jsx';

import * as MDL from 'react-mdl';
import {Dialog, DialogActions} from '../utils/Dialog.jsx';

export class ContinentDeploy extends Continent {
  componentWillMount() {
    this.$deployAnimal = (card, zoneIndex) => this.context.gameActions.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal) => {
      if (card.trait2type === null) {
        this.context.gameActions.$deployTrait(card.id, animal.id, card.trait1type);
      } else {
        this.context.gameActions.askForTrait(card.id);
        //this.context.gameActions.$deployTrait(card.id, animal.id, card.trait);
      }
    }
  }

  renderDialogs() {
    //return <Dialog show={true}>
    //  <MDL.DialogContent>
    //    ?
    //  </MDL.DialogContent>
    //  <DialogActions>
    //    <MDL.Button type='button' raised primary onClick={() => this.setState({show: false})}>trait1</MDL.Button>
    //    <MDL.Button type='button' raised primary onClick={() => this.setState({show: false})}>trait2</MDL.Button>
    //  </DialogActions>
    //</Dialog>
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