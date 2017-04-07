import React from 'react';

import {List, Map} from 'immutable';
import {DnDContextGameWrapper} from './GameWrapper.jsx';

import {UserModel, STATUS} from '../../../shared/models/UserModel';
import {PlayerModel} from '../../../shared/models/game/PlayerModel';
import {GameModel, GameModelClient, StatusRecord, PHASE} from '../../../shared/models/game/GameModel';
import {CardModel} from '../../../shared/models/game/CardModel';
import {AnimalModel} from '../../../shared/models/game/evolution/AnimalModel';
import * as cardTypes from '../../../shared/models/game/evolution/cards';
import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

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
        , hand: List([
          CardModel.new(cardTypes.CardCarnivorous).set('id', 'card0')
          , CardModel.new(cardTypes.CardCarnivorous).set('id', 'card1')
          , CardModel.new(cardTypes.CardCarnivorous).set('id', 'card2')
        ])
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
        , index: 1
        , status: STATUS.LOADING
      })
    })
    , status: new StatusRecord({
      turn: 0
      , round: 0
      , player: 0
      , phase: PHASE.DEPLOY
    })
  })
  , $ready: () => 0
  , $deployAnimal: () => 0
  , $deployTrait: () => 0
  , $gameEndTurnRequest: () => 0
});

const clientCardHID = ($Game, index) => $Game.find('DragSource(Card)').get(index).getHandlerId();
const clientContinentZoneHID = ($Game, index) => $Game.find('DropTarget(ContinentZone)').get(index).getHandlerId();
const clientAnimalHID = ($Game, index) => $Game.find('DropTarget(Animal)').get(index).getHandlerId();

describe('Game: Deploying:', () => {
  it('Displays default game', () => {
    const $Game = mount(<DnDContextGameWrapper {...makeClientState().toObject()}/>);
    expect($Game.find('.CardCollection.Deck').children(), '.CardCollection.Deck').length(12);
    expect($Game.find('.CardCollection.Hand').children(), '.CardCollection.Hand').length(3);
    expect($Game.find('.CardCollection.User1').children(), '.CardCollection.User1').length(6);
  });

  it('0-0, empty board', () => {
    let deployAnimal = {};
    const $deployAnimal = (cardId, animalPosition) => deployAnimal = {cardId, animalPosition};
    const $Game = mount(<DnDContextGameWrapper {...makeClientState().toObject()} $deployAnimal={$deployAnimal}/>);
    const dndBackend = $Game.instance().getManager().getBackend();

    //console.log($Game.find('.PlayerWrapper').debug())

    expect($Game.find('DropTarget(ContinentZone)'), 'DropTarget(ContinentZone)').length(1);
    expect($Game.find('DragSource(Card)').at(0).prop('disabled'), 'Card(0) is enabled').false;
    expect($Game.find('.animal-wrapper')).length(0);

    dndBackend.simulateBeginDrag([clientCardHID($Game, 0)]);
    expect($Game.find('.ContinentZone.highlight')).length(0);
    dndBackend.simulateHover([clientContinentZoneHID($Game, 0)]);
    expect($Game.find('.ContinentZone.highlight')).length(1);
    dndBackend.simulateDrop();
    dndBackend.simulateEndDrag();
    expect($Game.find('.ContinentZone.highlight')).length(0);
    expect(deployAnimal).eql({
      cardId: 'card0'
      , animalPosition: 0
    });

    dndBackend.simulateBeginDrag([clientCardHID($Game, 1)]);
    dndBackend.simulateHover([clientContinentZoneHID($Game, 0)]);
    dndBackend.simulateDrop();
    dndBackend.simulateEndDrag();
    expect(deployAnimal).eql({
      cardId: 'card1'
      , animalPosition: 0
    });
    expect($Game.find('.animal-wrapper'), 'hover reverts back').length(0);
  });

  it('0-0, board with 2 animals', () => {
    const props = makeClientState()
      .setIn(['game', 'players', 'User0', 'continent'], List([
        AnimalModel.new(CardModel.new(cardTypes.CardCamouflage)).set('id', 'animal0')
        , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage)).set('id', 'animal1')
      ]))
      .toObject();
    let deployAnimal = {};
    let deployTrait = {};
    const $deployAnimal = (cardId, animalPosition) => deployAnimal = {cardId, animalPosition};
    const $deployTrait = (cardId, animalId) => deployTrait = {cardId, animalId};
    const $Game = mount(<DnDContextGameWrapper {...props} $deployAnimal={$deployAnimal} $deployTrait={$deployTrait}/>);
    const dndBackend = $Game.instance().getManager().getBackend();

    expect($Game.find('DropTarget(ContinentZone)'), 'DropTarget(ContinentZone)').length(3);
    expect($Game.find('DropTarget(Animal)'), 'DropTarget(Animal)').length(2);
    expect($Game.find('.animal-wrapper')).length(2);

    // Deploy Animal
    expect($Game.find('.ContinentZone')).length(3);
    expect($Game.find('.ContinentZone.highlight')).length(0);
    dndBackend.simulateBeginDrag([clientCardHID($Game, 2)]);
    dndBackend.simulateHover([clientContinentZoneHID($Game, 1)]);
    expect($Game.find('.ContinentZone')).length(3);
    expect($Game.find('.ContinentZone.highlight')).length(1);
    dndBackend.simulateDrop();
    dndBackend.simulateEndDrag();
    expect(deployAnimal).eql({
      cardId: 'card2'
      , animalPosition: 1
    });

    // Deploy Trait
    expect($Game.find('.animal-wrapper')).length(2);
    dndBackend.simulateBeginDrag([clientCardHID($Game, 2)]);
    dndBackend.simulateHover([clientAnimalHID($Game, 1)]);
    dndBackend.simulateHover([clientAnimalHID($Game, 1)]);
    expect($Game.find('.animal-wrapper'), 'Deploy.trait:hover').length(2);
    dndBackend.simulateDrop();
    dndBackend.simulateEndDrag();
    expect(deployTrait).eql({
      cardId: 'card2'
      , animalId: 'animal1'
    });
  });

  it('endTurn', () => {
    let endTurn = false;
    const $endTurn = () => endTurn = true;
    const $Game = mount(<DnDContextGameWrapper {...makeClientState().toObject()} $endTurn={$endTurn}/>);

    expect($Game.find('.EndTurn')).length(1);
    $Game.find('.EndTurn').simulate('click');
    expect(endTurn).true;
  });

  it('0-1, board with 2 animals', () => {
    const props = makeClientState()
      .setIn(['game', 'players', 'User0', 'continent'], List([
        AnimalModel.new(CardModel.new(cardTypes.CardCamouflage)).set('id', 'animal0')
        , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage)).set('id', 'animal1')
      ]))
      .setIn(['game', 'status', 'player'], 1)
      .toObject();
    let deployAnimal = false;
    let deployTrait = false;
    let endTurn = false;
    const $deployAnimal = (cardId, animalPosition) => deployAnimal = true;
    const $deployTrait = (cardId, animalId) => deployTrait = true;
    const $endTurn = () => endTurn = true;
    const $Game = mount(<DnDContextGameWrapper {...props} $deployAnimal={$deployAnimal} $deployTrait={$deployTrait} $endTurn={$endTurn}/>);
    const dndBackend = $Game.instance().getManager().getBackend();

    expect($Game.find('DragSource(Card)').at(0).props().disabled, '.CardCollection.Hand').true;

    //// Deploy Animal
    //dndBackend.simulateBeginDrag([clientCardHID($Game, 2)]);
    //dndBackend.simulateHover([clientContinentZoneHID($Game, 1)]);
    //dndBackend.simulateDrop();
    //dndBackend.simulateEndDrag();
    //expect(deployAnimal).false;
    //
    //// Deploy Trait
    //dndBackend.simulateBeginDrag([clientCardHID($Game, 2)]);
    //dndBackend.simulateHover([clientAnimalHID($Game, 1)]);
    //dndBackend.simulateDrop();
    //dndBackend.simulateEndDrag();
    //expect(deployTrait).false;
  });
});