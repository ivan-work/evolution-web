import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {List} from 'immutable';

import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

import {ANIMAL_SIZE} from './Animal.jsx'

export class Continent extends React.Component {
  static contextTypes = {
    gameActions: React.PropTypes.object
    , phase: React.PropTypes.number
  };

  static propTypes = {
    isUserContinent: React.PropTypes.bool
    , continent: React.PropTypes.instanceOf(List).isRequired
  };

  static defaultProps = {
    isUserContinent: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);

  }

  componentWillMount() {
    //bindActions(this, 'gameActions', ['$deployAnimal', '$deployTrait']);
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
      onCardDropped={this.$deployTrait}/>
  }

  render() {
    const {continent} = this.props;
    const className = classnames({
      Continent: true
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