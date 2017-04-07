import React from 'react';
import {List} from 'immutable';

import {Animal} from './Animal.jsx';

import {CardModel} from '../../../shared/models/game/CardModel';
import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../shared/models/game/evolution/TraitModel';
import * as cardTypes from '../../../shared/models/game/evolution/cards';


describe('Animal', () => {
  it('Displays from Enemy', () => {
    const $Animal = shallow(<Animal model={AnimalModel.new()}/>);
    //expect($Animal.find('.AnimalFood')).length(2)
  });
  it('Displays Simple', () => {
    const $Animal = shallow(<Animal model={AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))}/>);
    //expect($Animal.find('.AnimalFood')).length(2)
  });
  it('Displays Food', () => {
    const $Animal = shallow(<Animal model={
      AnimalModel.new()
        .set('food', 2)
        }/>);
    expect($Animal.find('.AnimalFood')).length(2)
  });
  //it('Displays traits', () => {
  //  const $Animal = shallow(<Animal model={
  //    AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
  //      .set('traits', List.of(
  //        TraitModel.new('TraitCarnivorous')
  //      ))
  //      .set('food', 2)
  //      }/>);
  //  console.log($Animal.debug());
  //});
});