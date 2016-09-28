import React from 'react';
import {List, Map, Range} from 'immutable';
import {CardCollection} from './CardCollection.jsx';

import {CardModel} from '../../../shared/models/game/CardModel';
//import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('CardCollection', () => {
  it('Displays children', () => {
    const $CardCollection = shallow(<CardCollection
      name="testcc"
      shift={[10, 5]}>
      <div className='child' id="0"/>
      <div className='child' id="1"/>
      <div className='child' id="2"/>
    </CardCollection>);
    expect($CardCollection.children().length).equal(3);
    expect($CardCollection.find('#0').length).equal(1);
    expect($CardCollection.find('#1').length).equal(1);
    expect($CardCollection.find('#2').length).equal(1);
  });

  it('Displays child', () => {
    const $CardCollection = shallow(<CardCollection
      name="testcc"
      shift={[10, 5]}>
      <div id="0"/>
    </CardCollection>);
    expect($CardCollection.children().length).equal(1);
    expect($CardCollection.find('#0').length).equal(1);
  });

  it('Displays empty', () => {
    const $CardCollection = shallow(<CardCollection
      name="testcc"
      shift={[10, 5]}>
    </CardCollection>);
    expect($CardCollection.children().length).equal(0);
  });

  it('Wraps into CardPlace', () => {
    const cards = CardModel.generate(3);
    const $CardCollection = shallow(<CardCollection
      name="testcc"
      shift={[10, 5]}>
      <div id="1"/>
      <div id="2"/>
      <div id="3"/>
    </CardCollection>);
    expect($CardCollection.find('.CardPlace').length).equal(3);
    expect($CardCollection.find('.CardPlace').at(0).props().style.transform).equal('translate(0px,0px)');
    expect($CardCollection.find('.CardPlace').at(1).props().style.transform).equal('translate(10px,5px)');
    expect($CardCollection.find('.CardPlace').at(2).props().style.transform).equal('translate(20px,10px)');
  });
  //it('Displays Card', () => {
  //  const $CardCollection = shallow(<CardCollection
  //    ref="testcc" name="testcc"
  //    shift={[1, 0]}>
  //    <div id="1"/>
  //    <div id="2"/>
  //    <div id="3"/>
  //  </CardCollection>);
  //  console.log($CardCollection.debug())
  //  //expect($CardCollection.find('.CardPlace').length).equal(3);
  //  //expect($CardCollection.find('.CardPlace').at(0).props().style.transform).equal('translate(0px,0px)');
  //  //expect($CardCollection.find('.CardPlace').at(1).props().style.transform).equal('translate(10px,5px)');
  //  //expect($CardCollection.find('.CardPlace').at(2).props().style.transform).equal('translate(20px,10px)');
  //});
});