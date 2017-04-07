import React from 'react';
import {List, Map, Range} from 'immutable';
import {PlayerContinent} from './PlayerContinent.jsx';
import {Card} from './Card.jsx';

import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';
//import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('PlayerContinent', () => {
  it('Empty', () => {
    const $PlayerContinent = shallow(<PlayerContinent/>);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length).equal(1);
  });
  it('One Card', () => {
    const $PlayerContinent = shallow(<PlayerContinent continent={List.of(AnimalModel.new())}/>);
    expect($PlayerContinent.find('DropTarget(Animal)'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(2);
  });
  it('onOverZone 0A over > 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent/>);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(0);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(1);
    $PlayerContinent.instance().onOverZone(true, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(1);
    $PlayerContinent.instance().onOverZone(false, 0);
  });
  it('onOverZone 1A over > 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent continent={List.of(AnimalModel.new())}/>);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOverZone(true, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('.animal-placeholder'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('DropTarget(Animal)'), 'child.length').true;
    $PlayerContinent.instance().onOverZone(false, 0);
  });
  it('onOverZone 1A over > 1', () => {
    const $PlayerContinent = shallow(<PlayerContinent continent={List.of(AnimalModel.new())}/>);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOverZone(true, 1);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('DropTarget(Animal)'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('.animal-placeholder'), 'child.length').true;
    $PlayerContinent.instance().onOverZone(false, 1);
  });
  it('onOverZone 1A over > 0 > 1 > 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent continent={List.of(AnimalModel.new())}/>);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOverZone(true, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('.animal-placeholder'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('DropTarget(Animal)'), 'child.length').true;
    $PlayerContinent.instance().onOverZone(true, 1);
    $PlayerContinent.instance().onOverZone(false, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('DropTarget(Animal)'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('.animal-placeholder'), 'child.length').true;
  });
  it('onOverAnimal 1A position 0 > 0A', () => {
    const $PlayerContinent = shallow(<PlayerContinent continent={List.of(AnimalModel.new())}/>);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOverZone(true, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper'), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('.animal-placeholder'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('DropTarget(Animal)'), 'child.length').true;
    $PlayerContinent.instance().onOverAnimal(true, 0);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animal-wrapper.highlight'), 'child.length').length(1);
    expect($PlayerContinent.find('.animal-wrapper.highlight').children().at(0).is('DropTarget(Animal)'), 'child.length').true;
  });
});