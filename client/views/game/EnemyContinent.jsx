import React from 'react';
import Immutable from 'immutable';

import {ANIMAL_SIZE} from './Animal.jsx'
import {ANIMAL_MARGIN} from './PlayerContinent.jsx'

export class EnemyContinent extends React.Component {
  render() {
    return <div className="EnemyContinent">
      <div className="animals-container-outer">
        <div className="animals-container-inner">
          {React.Children.map(this.props.children, (child, i) => {
            return <div className='animal-wrapper' style={{margin: ANIMAL_MARGIN, ...ANIMAL_SIZE}} key={i}>{child}</div>
            })}
        </div>
      </div>
    </div>;
  }
}