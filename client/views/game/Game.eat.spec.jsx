import React from 'react';

import {List, Map} from 'immutable';
import {Game, DDCGame} from './Game.jsx';

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
    , deck: 12
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
      , phase: PHASE.FEEDING
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

describe('Game: Eating:', () => {
});