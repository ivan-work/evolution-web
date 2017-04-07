import React from 'react';
import {List} from 'immutable';
import classnames from 'classnames';
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

import {ANIMAL_SIZE} from './Animal.jsx'

export class PlayerContinent extends React.Component {
  static propTypes = {
    $deployAnimal: React.PropTypes.func
    , $deployTrait: React.PropTypes.func
    , isUserContinent: React.PropTypes.bool
  };

  static defaultProps = {
    isUserContinent: false
    , continent: List()
  };

  constructor(props) {
    super(props);
    this.onOver = this.onOver.bind(this);
    this.onOverZone = this.onOverZone.bind(this);
    this.onOverAnimal = this.onOverAnimal.bind(this);
    this.state = {overIndex: null, overAnimal: null}
  }

  onOverZone(isOver, index) {
    this.onOver(isOver, false, index);
  }

  onOverAnimal(isOver, index) {
    this.onOver(isOver, true, index);
  }

  onOver(isOver, isAnimal, index) {
    if (isOver) {
      this.setState({overAnimal: isAnimal, overIndex: index});
      //} else if (this.state.overAnimal === isAnimal && this.state.overIndex === index) {
    } else {
      this.setState({overAnimal: null, overIndex: null});
    }
  }

  renderPlaceholderWrapper(index) {
    return !this.props.isUserContinent
      ? null
      : <DropTargetContinentZone
      key={index}
      index={index}
      className={classnames({
        'animal-placeholder': true
        , 'highlight': this.state.overAnimal && this.state.overIndex === index
        })}
      onCardDropped={this.props.$deployAnimal}
      onOver={this.onOverZone}>
    </DropTargetContinentZone>
  }

  renderAnimal(animal, index) {
    return <div
      key={animal.id}
      className={classnames({
        'animal-wrapper': true
        , 'highlight': this.state.overAnimal && this.state.overIndex === index
        })}>
      <DropTargetAnimal
        index={index}
        model={animal}
        onOver={this.onOverAnimal}
        onCardDropped={this.props.$deployTrait}/>
    </div>
  }

  render() {
    const {continent} = this.props;
    return <div className="PlayerContinent">
      <div className="animals-container-outer">
        <div className="animals-container-inner">
          {this.renderPlaceholderWrapper(0)}
          {continent.toArray().map((animal, index) => {
            return [
              this.renderAnimal(animal, index)
              , this.renderPlaceholderWrapper(index + 1)
              ]})}
        </div>
      </div>
    </div>;
  }
}