import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {List} from 'immutable';
import classnames from 'classnames';
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

import {ANIMAL_SIZE} from './Animal.jsx'

export class ContinentPhaseDeploy extends React.Component {
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
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.onOver = this.onOver.bind(this);
    this.onOverZone = (isOver, index) => this.onOver(isOver, false, index);
    this.onOverAnimal = (isOver, index) => this.onOver(isOver, true, index);

    this.state = {overIndex: null, overAnimal: false};
    this.$deployAnimal = (card, zoneIndex) => this.props.$deployAnimal(card.id, zoneIndex);
    this.$deployTrait = (card, animal) => this.props.$deployTrait(card.id, animal.id);

  }

  onOver(isOver, isAnimal, index) {
    if (isOver) {
      this.setState({overAnimal: isAnimal, overIndex: index});
    } else {
      this.setState({overAnimal: false, overIndex: null});
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
      onCardDropped={this.$deployAnimal}
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
        onCardDropped={this.$deployTrait}/>
    </div>
  }

  render() {
    const {continent} = this.props;
    const className = classnames({
      Continent: true
      , ContinentPhaseDeploy: true
      , UserContinent: this.props.isUserContinent
    });
    return <div className={className}>
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