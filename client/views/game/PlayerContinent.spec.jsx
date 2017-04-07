import React from 'react';
import {List, Map, Range} from 'immutable';
import {PlayerContinent} from './PlayerContinent.jsx';
import {Card} from './Card.jsx';

import {CardModel} from '../../../shared/models/game/CardModel';
//import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('PlayerContinent', () => {
  it('Empty', () => {
    const $PlayerContinent = shallow(<PlayerContinent></PlayerContinent>);
    expect($PlayerContinent.find('DropTarget(PlayerContinentDropTargetZone)').length).equal(1);
  });
  it('One Card', () => {
    const $PlayerContinent = shallow(<PlayerContinent>
      <Card/>
    </PlayerContinent>);
    //console.log($PlayerContinent.debug())
    expect($PlayerContinent.find('Card').length, 'Card.length').equal(1);
    expect($PlayerContinent.find('DropTarget(PlayerContinentDropTargetZone)').length, 'PlayerContinentDropTargetZone').equal(2);

    //console.log($PlayerContinent.get(0))
  });
});