import React from 'react';
import Immutable from 'immutable';

import {ANIMAL_SIZE} from './Animal.jsx'
import {ANIMAL_MARGIN} from './PlayerContinent.jsx'

export class EnemyContinent extends React.Component {
  render() {
    return <div className="EnemyContinent">
      <div className="cards-container-outer">
        <div className="cards-container-inner">
          {React.Children.map(this.props.children, (child, i) => {
            return <div className='card-wrapper' style={{margin: ANIMAL_MARGIN, ...ANIMAL_SIZE}} key={i}>{child}</div>
            })}
        </div>
      </div>
    </div>;
  }
}