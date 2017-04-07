import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import RIP from 'react-immutable-proptypes';

import {DropTargetContinentZone} from './ContinentZone.jsx';

import './Continent.scss';

export default class Continent extends React.Component {
  static contextTypes = {
    gameActions: React.PropTypes.object
  };

  static propTypes = {
    isUserContinent: React.PropTypes.bool.isRequired
    , children: RIP.listOf(React.PropTypes.node)
  };

  constructor(props, context) {
    super(props, context);
    this.$deployAnimal = (card, zoneIndex) => context.gameActions.$deployAnimal(card.id, zoneIndex);
  }

  render() {
    const {children, isUserContinent} = this.props;
    const className = classnames({
      Continent: true
      , UserContinent: isUserContinent
      , EnemyContinent: !isUserContinent
    });
    return <div className={className}>
      {this.renderPlaceholderWrapper(0)}
      {children.map((animal, index) => {
        return [
          animal
          , this.renderPlaceholderWrapper(index + 1)
          ]})}
    </div>;
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
}