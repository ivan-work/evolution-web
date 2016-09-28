import React from 'react';

import {List, Map} from 'immutable';
import {DnDContextGameWrapper} from './GameWrapper.jsx';

import {UserModel, STATUS} from '../../../shared/models/UserModel';
import {PlayerModel} from '../../../shared/models/game/PlayerModel';
import {GameModel, GameModelClient, StatusRecord, PHASE} from '../../../shared/models/game/GameModel';
import {CardModel} from '../../../shared/models/game/CardModel';
import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../shared/models/game/evolution/TraitModel';
import * as cardTypes from '../../../shared/models/game/evolution/cards';

const makeClientState = () => Map({
  user: new UserModel({
    id: 'User0'
    , login: 'User0'
    , status: STATUS.OFFLINE
  })
  , game: new GameModelClient({
    id: null
    , userId: 'User0'
    , roomId: null
    , deck: GameModel.generateDeck([[12, cardTypes.CardCarnivorous]])
    , players: Map({
      User0: new PlayerModel({
        id: 'User0'
        , hand: List.of(
          CardModel.new(cardTypes.CardCarnivorous).set('id', 'card0')
          , CardModel.new(cardTypes.CardCarnivorous).set('id', 'card1')
          , CardModel.new(cardTypes.CardCarnivorous).set('id', 'card2')
        )
        , continent: List.of(
          AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            .set('id', 'animal0')
            .set('food', 1)
            .set('traits', List.of(
              TraitModel.new(cardTypes.CardCarnivorous.type)
            ))
          , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            .set('id', 'animal1')
            .set('traits', List.of(
              TraitModel.new(cardTypes.CardCarnivorous.type)
              , TraitModel.new(cardTypes.CardSharpVision.type)
              , TraitModel.new(cardTypes.CardCamouflage.type)
            ))
          , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            .set('id', 'animal2')
            .set('food', 1)
        )
        , index: 0
        , status: STATUS.LOADING
      })
      , User1: new PlayerModel({
        id: 'User1'
        , hand: GameModel.generateDeck([
          [2, cardTypes.CardCarnivorous]
          , [2, cardTypes.CardCamouflage]
          , [2, cardTypes.CardSharpVision]
        ])
        , continent: List.of(
          AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            .set('id', 'animal3')
          , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            .set('id', 'animal4')
            .set('traits', List.of(
              TraitModel.new(cardTypes.CardCamouflage.type)
            ))
        )
        , index: 1
        , status: STATUS.LOADING
      })
    })
    , food: 12
    , status: new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: PHASE.FEEDING
    })
  })
  , $ready: () => 0
  , $deployAnimal: () => 0
  , $deployTrait: () => 0
  , $traitTakeFood: () => 0
  , $endTurn: () => 0
});

const clientCardHID = ($Game, index) => $Game.find('DragSource(Card)').get(index).getHandlerId();
const clientContinentZoneHID = ($Game, index) => $Game.find('DropTarget(ContinentZone)').get(index).getHandlerId();
const clientAnimalHID = ($Game, index) => $Game.find('DropTarget(Animal)').get(index).getHandlerId();
const clientTraitHID = ($Game, animalIndex, traitIndex) => $Game
  .find('DropTarget(Animal)').at(animalIndex)
  .find('DragSource(AnimalTrait)').get(traitIndex)
  .getHandlerId();
const clientFoodHID = ($Game, index) => $Game
  .find('DragSource(Food)').get(index)
  .getHandlerId();

describe('Game: Feeding:', () => {
  it('Displays default game', () => {
    const $Game = mount(<DnDContextGameWrapper {...makeClientState().toObject()}/>);
    expect($Game.find('.GameFoodContainer'), '.GameFoodContainer').length(1);
    expect($Game.find('.GameFoodContainer .Food'), '.GameFoodContainer .Food').length(12);
    expect($Game.find('.CardCollection.Deck').children(), '.CardCollection.Deck').length(12);
    expect($Game.find('.CardCollection.Hand').children(), '.CardCollection.Hand').length(3);
    expect($Game.find('.Continent.UserContinent'), '..Continent.UserContinent').length(1);
    expect($Game.find('.Continent.UserContinent .Animal'), '.Continent.UserContinent .Animal').length(3);
    expect($Game.find('.Continent.EnemyContinent'), '.Continent.EnemyContinent').length(1);
    expect($Game.find('.Continent.EnemyContinent .Animal'), '.Continent.EnemyContinent .Animal').length(2);
  });

  it('0-0 Food taking', () => {
    let traitTakeFood;
    const $traitTakeFood = (animalId) => traitTakeFood = animalId;
    const $Game = mount(<DnDContextGameWrapper {...makeClientState().toObject()} $traitTakeFood={$traitTakeFood}/>);
    const dndBackend = $Game.instance().getManager().getBackend();

    dndBackend.simulateBeginDrag([clientFoodHID($Game, 0)]);
    dndBackend.simulateHover([clientAnimalHID($Game, 0)]);
    dndBackend.simulateDrop();
    dndBackend.simulateEndDrag();
    expect(traitTakeFood).eql('animal0');
  });
});