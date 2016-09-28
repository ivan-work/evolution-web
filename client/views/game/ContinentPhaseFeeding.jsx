import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {List} from 'immutable';
import classnames from 'classnames';
import {DropTargetContinentZone} from './ContinentZone.jsx'
import {DropTargetAnimal} from './Animal.jsx';

import {ANIMAL_SIZE} from './Animal.jsx'

export class ContinentPhaseFeeding extends React.Component {
  static propTypes = {
    continent: React.PropTypes.instanceOf(List)
    , isUserContinent: React.PropTypes.bool
    , $traitTakeFood: React.PropTypes.func
    , $traitActivate: React.PropTypes.func
  };

  static defaultProps = {
    isUserContinent: false
    , continent: List()
    , $traitTakeFood: () => 0
    , $traitActivate: () => 0
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.$traitTakeFood = this.props.$traitTakeFood.bind(this);
    this.$traitActivate = this.props.$traitActivate.bind(this);
  }

  renderAnimal(animal, index) {
    return <div
      key={animal.id}
      className={classnames({
        'animal-wrapper': true
        })}>
      <DropSourceAnimal
        index={index}
        model={animal}/>
    </div>
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
          {continent.toArray().map((animal, index) => this.renderAnimal(animal, index))}
        </div>
      </div>
    </div>;
  }
}