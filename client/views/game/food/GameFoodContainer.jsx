import React from 'react';

import {DragFood, Food} from './Food.jsx';

const la2xy = (p, a) => {
  return {
    x: p * Math.cos(a)
    , y: p * Math.sin(a)
  }
};

export const GameFoodContainer = ({food, onFoodRemoved}) => (
  <div className='GameFoodContainer'>
    {/*Array.from({length: food}).map((u, index) => <DragFood key={index}/>)*/}
    {
      food.map((fid, index) => {
        let p = {x: 0, y: 0}
          , a = 0;
        if (index <= 0) {
          p.x = p.y = a = 0;
        } else if (index <= 6) {
          a = (index - 1) % 6 * (Math.PI * 2 / 6);
          p = la2xy(22, a);
        } else if (index - 6 <= 12) {
          a = (index + 3) % 12 * (Math.PI * 2 / 12);
          p = la2xy(44, a);
        } else if (index - 12 <= 24) {
          a = (index + 14) % 18 * (Math.PI * 2 / 18);
          p = la2xy(66, a);
        }
        //  const tiers = [1, 6];
        //const tierRadius = 0;
        //for (let i = 0, tierIndex = 0; i < tiers.length; ++i) {
        //  if (tierIndex > tierRadius) {
        //
        //    }
        //
        //  }
        return (<div key={fid} onClick={() => onFoodRemoved(fid)}style={{
          position: 'absolute'
          , transform: `translate(${p.x}px, ${p.y}px)`
          , transition: `all .5s`
        }}><Food/></div>);
        })
      }
  </div>
);


GameFoodContainer.propTypes = {
  food: React.PropTypes.number.isRequired
};