import React from 'react';
import {List} from 'immutable';
import classnames from 'classnames';
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

import {ANIMAL_SIZE} from './Animal.jsx'
export const ANIMAL_MARGIN = 10;

export class PlayerContinent extends React.Component {
  static propTypes = {
    $deployAnimal: React.PropTypes.func
    , $deployTrait: React.PropTypes.func
  };

  static defaultProps = {
    continent: List()
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
    console.log('onOver', isOver, isAnimal, index);
    if (isOver) {
      this.setState({overAnimal: isAnimal, overIndex: index});
      //} else if (this.state.overAnimal === isAnimal && this.state.overIndex === index) {
    } else {
      this.setState({overAnimal: null, overIndex: null});
    }
  }

  renderDropTarget(index, ANIMALS_COUNT) {
    let width = 0;
    if (ANIMALS_COUNT == 0) {
      width = `100%`;
    } else if (index == 0 || index == ANIMALS_COUNT) {
      width = `calc(50% - ${(ANIMALS_COUNT - 1) * ((ANIMAL_SIZE.width + ANIMAL_MARGIN * 2) / 2)}px)`;
    } else {
      width = ANIMAL_SIZE.width + ANIMAL_MARGIN * 2 + 'px'
    }
    return <DropTargetContinentZone
      key={index}
      width={width}
      index={index}
      onCardDropped={this.props.$deployAnimal}
      onOver={this.onOverZone}/>
  }

  renderPlaceholderWrapper(index) {
    const width = (!this.state.overAnimal && this.state.overIndex === index ? ANIMAL_SIZE.width : '0%');
    return <div
      key={'over' + index}
      className={classnames({
        'animal-wrapper': true
        , 'highlight': this.state.overAnimal && this.state.overIndex === index
        })}
      style={{width, height: ANIMAL_SIZE.height}}>
      <div className="animal-placeholder"></div>
    </div>
  }

  renderAnimalWrapper(child, key) {
    return <div
      key={key}
      className={classnames({
        'animal-wrapper': true
        , 'highlight': this.state.overAnimal && this.state.overIndex === key
        })}
      style={{margin: ANIMAL_MARGIN, ...ANIMAL_SIZE}}>{child}</div>
  }

  render() {
    const {continent} = this.props;
    let children = continent.toArray();

    //if (!this.state.overAnimal && this.state.overIndex !== null) {
    //  children.splice(this.state.overIndex, 0, true);
    //}

    //console.log('children', children)
    const ANIMALS_COUNT = continent.size;
    return <div className="PlayerContinent">
      <div className="drop-targets-container">
        {Array.from({length: 1 + continent.size})
          .map((u,i) => this.renderDropTarget(i, ANIMALS_COUNT))}
      </div>
      <div className="animals-container-outer">
        <div className="animals-container-inner">
          {this.renderPlaceholderWrapper(0)}
          {children.map((animal, index) => {
            return [
              this.renderAnimalWrapper(<DropTargetAnimal
                index={index}
                model={animal}
                onOver={this.onOverAnimal}
                onCardDropped={this.props.$deployTrait}/>, index)
              , this.renderPlaceholderWrapper(index + 1)
              ]})}
        </div>
      </div>
    </div>;
  }
}