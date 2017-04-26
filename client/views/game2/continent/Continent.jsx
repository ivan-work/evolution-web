import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';

import RIP from 'react-immutable-proptypes';

import ContinentZone from './ContinentZone.jsx';

import './Continent.scss';

export default class Continent extends React.Component {
  static propTypes = {
    isUserContinent: PropTypes.bool.isRequired
    , children: RIP.listOf(PropTypes.node)
  };

  render() {
    const {children, isUserContinent, isActive} = this.props;
    const className = classnames({
      Continent: true
      , UserContinent: isUserContinent
      , EnemyContinent: !isUserContinent
      , isActive
    });
    return <div className={className}>
      {this.renderPlaceholderWrapper(0)}
      {children.map((animal, index) => {
        return [
          animal
          , this.renderPlaceholderWrapper(index + 1)
        ]
      })}
    </div>;
  }

  renderPlaceholderWrapper(index) {
    return this.props.isUserContinent && <ContinentZone key={index} index={index}/> || null;
  }
}