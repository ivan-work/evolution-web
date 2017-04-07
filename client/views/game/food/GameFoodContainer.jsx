import React from 'react';

import {DragFood} from './Food.jsx';

export const GameFoodContainer = ({food}) => (
  <div className='GameFoodContainer'>
    {Array.from({length: food}).map((u, index) => <DragFood key={index}/>)}
  </div>
);


GameFoodContainer.propTypes = {
  food: React.PropTypes.number.isRequired
};