import React from 'react';
import {List, Map, Range} from 'immutable';
import {CardCollection} from './CardCollection.jsx';

import {CardModel} from '../../../shared/models/game/CardModel';
//import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('CardCollection', () => {
  it('Displays cards from list', () => {
    const cards = CardModel.generate(4);
    const $CardCollection = shallow(<CardCollection
      ref="testcc" name="testcc"
      position={{top: 0, left: '50%'}}
      shift={[1, 1]}
      cards={cards}/>);
    expect($CardCollection.find('Card').length).equal(4);
  });
  it('Displays cards from number', () => {
    const $CardCollection = shallow(<CardCollection
      ref="testcc" name="testcc"
      position={{top: 0, left: '50%'}}
      shift={[1, 1]}
      count={4}/>);
    expect($CardCollection.find('Card').length).equal(4);
  });
});