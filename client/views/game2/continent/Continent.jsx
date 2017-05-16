import {List} from 'immutable';

import React from 'react';
import PropTypes from 'prop-types'
import classnames from 'classnames';

import RIP from 'react-immutable-proptypes';

import ContinentZone from './ContinentZone.jsx';

import './Continent.scss';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

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
    let mixedChildren = [this.renderPlaceholderWrapper(0, 0)];
    children.forEach((animal, index) => {
      mixedChildren.push(animal);
      mixedChildren.push(this.renderPlaceholderWrapper(index + 1, 'pre' + animal.key));
    });
    mixedChildren = mixedChildren.filter(c => !!c);
    // transitionLeaveTimeout IS THE SAME AS ../animals/Animal.scss
    return (
      <CSSTransitionGroup component="div"
                          className={className}
                          transitionName="Death"
                          transitionEnterTimeout={1}
                          transitionLeaveTimeout={450}>
        {mixedChildren}
      </CSSTransitionGroup>
    );
  }

  renderPlaceholderWrapper(index, key) {
    return this.props.isUserContinent && <ContinentZone key={key} index={index}/> || null;
  }
}