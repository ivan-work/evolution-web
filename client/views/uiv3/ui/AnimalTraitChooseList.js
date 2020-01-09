import React from 'react';
import noop from 'lodash/noop';

import {AnimalTraitBase} from "../animals/AnimalTrait";

const AnimalTraitChooseList = (({classes, traitList, checkTrait, onSelectTrait, disableTrait}) => {
  return (traitList.reverse().map(trait => {
    const isInteractive = checkTrait(trait);
    return (<AnimalTraitBase key={trait.id}
                             trait={trait}
                             canStart={isInteractive}
                             startInteraction={isInteractive ? onSelectTrait(trait) : noop}
                             disabled={disableTrait(trait)}
    />);
  }));
});

AnimalTraitChooseList.defaultProps = {
  disableTrait: () => false
  , checkTrait: () => false
  , onSelectTrait: () => noop
};

export default AnimalTraitChooseList;