import React from 'react';
import {List, Map, Range} from 'immutable';
import {ContinentPhaseFeeding} from './ContinentPhaseFeeding.jsx';
import {Card} from './Card.jsx';

import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';

describe('Continent', () => {
  it('Empty', () => {
    const $Continent = shallow(<ContinentPhaseFeeding isUserContinent={true}/>);
    expect($Continent.find('DropTarget(ContinentZone)').length).equal(1);
  });
  it('One Card', () => {
    const $Continent = shallow(<ContinentPhaseFeeding isUserContinent={true} continent={List.of(AnimalModel.new())}/>);
    expect($Continent.find('DropTarget(Animal)'), 'child.length').length(1);
    expect($Continent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(2);
  });
});