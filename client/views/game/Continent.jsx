import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {List} from 'immutable';

import {DropTargetContinentZone} from './ContinentZone.jsx'

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
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  renderDialogs() {
    return null;
  }

  render() {
    const {continent} = this.props;
    const className = classnames({
      Continent: true
      , UserContinent: this.props.isUserContinent
      , EnemyContinent: !this.props.isUserContinent
    });
    return <div className={className}>
      {this.renderDialogs()}
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