import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {List} from 'immutable';

import {DropTargetContinentZone} from './ContinentZone.jsx';

import './Continent.scss';

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

  render() {
    const {continent} = this.props;
    const className = classnames({
      Continent: true
      , [this.getClassName()]: true
      , UserContinent: this.props.isUserContinent
      , EnemyContinent: !this.props.isUserContinent
    });
    return <div className={className}>
      {this.renderPlaceholderWrapper(0)}
      <div className="slice">
        {continent.skip(10).toArray().map((animal, index) => {
          return [
            this.renderAnimal(animal, index)
            , this.renderPlaceholderWrapper(index + 1)
            ]})}
      </div>
      <div className="slice">
        {continent.take(10).toArray().map((animal, index) => {
          return [
            this.renderAnimal(animal, index)
            , this.renderPlaceholderWrapper(index + 1)
            ]})}
      </div>
    </div>;
  }
}