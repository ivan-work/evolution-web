import React from 'react';
import {List, Map, Range} from 'immutable';
import {Continent} from './Continent.jsx';
import {Card} from './Card.jsx';

import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';

describe('Continent', () => {
  it('Empty', () => {
    const $Continent = shallow(<Continent
      isUserContinent={true}
      continent={List()}
      phase={0}/>);
    expect($Continent.find('DropTarget(ContinentZone)').length).equal(1);
  });
  it('One Card', () => {
    const $Continent = shallow(<Continent
      isUserContinent={true}
      continent={List.of(AnimalModel.new())}
      phase={0}/>);
    expect($Continent.find('DropTarget(Animal)'), 'child.length').length(1);
    expect($Continent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(2);
  });
  //it('onOverZone 0A over > 0', () => {
  //  const $Continent = shallow(<Continent isUserContinent={true}/>);
  //  expect($Continent.state('overIndex')).equal(null);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverZone(true, 0);
  //  expect($Continent.state('overIndex')).equal(0);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverZone(false, 0);
  //  expect($Continent.state('overIndex')).equal(null);
  //  expect($Continent.state('overAnimal')).equal(false);
  //});
  //it('onOverZone 1A over > 0 > 1 > 0', () => {
  //  const $Continent = shallow(<Continent isUserContinent={true} continent={List.of(AnimalModel.new())}/>);
  //  expect($Continent.state('overIndex')).equal(null);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverZone(true, 0);
  //  expect($Continent.state('overIndex')).equal(0);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverZone(true, 1);
  //  expect($Continent.state('overIndex')).equal(1);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverZone(false, 0);
  //  expect($Continent.state('overIndex')).equal(1);
  //  expect($Continent.state('overAnimal')).equal(false);
  //});
  //it('onOverAnimal 1A position 0 > 0A', () => {
  //  const $Continent = shallow(<Continent isUserContinent={true} continent={List.of(AnimalModel.new())}/>);
  //  $Continent.instance().onOverZone(true, 0);
  //  expect($Continent.state('overIndex')).equal(0);
  //  expect($Continent.state('overAnimal')).equal(false);
  //  $Continent.instance().onOverAnimal(true, 0);
  //  expect($Continent.state('overIndex')).equal(0);
  //  expect($Continent.state('overAnimal')).equal(true);
  //  $Continent.instance().onOverZone(false, 0);
  //  expect($Continent.state('overIndex')).equal(0);
  //  expect($Continent.state('overAnimal')).equal(true);
  //});
});