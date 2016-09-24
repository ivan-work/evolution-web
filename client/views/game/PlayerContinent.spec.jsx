import React from 'react';
import {List, Map, Range} from 'immutable';
import {PlayerContinent} from './PlayerContinent.jsx';
import {Card} from './Card.jsx';

import {CardModel} from '../../../shared/models/game/CardModel';
//import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('PlayerContinent', () => {
  it('Empty', () => {
    const $PlayerContinent = shallow(<PlayerContinent></PlayerContinent>);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length).equal(1);
  });
  it('One Card', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
      <hr/>
    </PlayerContinent>);
    expect($PlayerContinent.find('hr'), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(2);
  });
  it('onOver animals 0 position 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
    </PlayerContinent>);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(0);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(1);
    $PlayerContinent.instance().onOver(0, true);
    $PlayerContinent.update();
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)'), 'ContinentZone').length(1);
    $PlayerContinent.instance().onOver(0, false);
  });
  it('onOver animals 1 position 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
      <hr/>
    </PlayerContinent>);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOver(0, true);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('.animal-placeholder'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('hr'), 'child.length').true;
    $PlayerContinent.instance().onOver(0, false);
  });
  it('onOver animals 1 position 1', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
      <hr/>
    </PlayerContinent>);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOver(1, true);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('hr'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('.animal-placeholder'), 'child.length').true;
    $PlayerContinent.instance().onOver(1, false);
  });
  it('onOver animals 1 position 0 > 1 > 0', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
      <hr/>
    </PlayerContinent>);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(1);
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    $PlayerContinent.instance().onOver(0, true);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('.animal-placeholder'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('hr'), 'child.length').true;
    $PlayerContinent.instance().onOver(1, true);
    $PlayerContinent.instance().onOver(0, false);
    $PlayerContinent.update();
    expect($PlayerContinent.find('DropTarget(ContinentZone)').length, 'ContinentZone').equal(2);
    expect($PlayerContinent.find('.animals-container-inner').children(), 'child.length').length(2);
    expect($PlayerContinent.find('.animal-wrapper').children().at(0).is('hr'), 'child.length').true;
    expect($PlayerContinent.find('.animal-wrapper').children().at(1).is('.animal-placeholder'), 'child.length').true;
  });
});