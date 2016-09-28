import {Map, List} from 'immutable';

import {GameModel, PHASE} from '../models/game/GameModel';
import {CardModel} from '../models/game/CardModel';
import * as cardTypes from '../models/game/evolution/cards';
import {AnimalModel} from '../models/game/evolution/AnimalModel';
import {TraitModel} from '../models/game/evolution/TraitModel';

import {
  traitTakeFoodRequest
  , gameEndTurnRequest
  , traitActivateRequest
  , gameDeployAnimalRequest
  , gameDeployTraitRequest
} from '../actions/actions';

describe('Game Hacking (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ServerGame, CreateGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    CreateGame({
      players: {
        [User0.id]: {
          hand: GameModel.generateDeck([[6, cardTypes.CardCamouflage]])
          , continent: [
            AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
          ]
        }
        , [User1.id]: {
          continent: [
            AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
            , AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))
          ]
        }
      }
      , food: 2
      , status: {
        turn: 0
        , round: 0
        , player: 0
        , phase: PHASE.FEEDING
      }
    });

    expectUnchanged(() => clientStore0.dispatch(gameDeployAnimalRequest(ClientGame0().getPlayerCard(User0, 0).id, 0)), serverStore, clientStore1);
  });
});