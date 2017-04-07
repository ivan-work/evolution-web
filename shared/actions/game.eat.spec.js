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
} from '../actions/actions';

describe('Game (EAT PHASE):', function () {
  it('Simple eating', () => {
    const [{serverStore, ServerGame, CreateGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    CreateGame({
      players: {
        [User0.id]: {continent: [
          AnimalModel.new(User0.id)
          , AnimalModel.new(User0.id)
        ]}
        , [User1.id]: {continent: [
          AnimalModel.new(User1.id)
          , AnimalModel.new(User1.id)
        ]}
      }
      , food: 2
      , status: {
        turn: 0
        , round: 0
        , player: 0
        , phase: PHASE.FEEDING
      }
    });

    expectUnchanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame1().getPlayerAnimal(User1, 0).id)), serverStore, clientStore1);
    expectUnchanged(() => clientStore1.dispatch(gameEndTurnRequest()), serverStore, clientStore1);

    //clientStore0.clearActions();
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    //console.log(clientStore0.getActions())

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0);

    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().food, 'ServerGame().food').equal(1);
    expect(ClientGame0().food, 'ClientGame0().food').equal(1);
    expect(ClientGame1().food, 'ClientGame1().food').equal(1);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ClientGame0().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ClientGame1().getPlayerAnimal(User0, 0).food).equal(1);

    clientStore1.dispatch(gameEndTurnRequest());

    expect(ServerGame().food, 'Players dont take food when skip turns //TODO').equal(1);

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0);

    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 1).id));

    expect(ServerGame().food).equal(0);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(1);
    expect(ServerGame().getPlayerAnimal(User0, 1).food).equal(1);
  });

  it('Increased eating', () => {
    const [{serverStore, ServerGame, CreateGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    CreateGame({
      players: {
        [User0.id]: {continent: [
          AnimalModel.new(User0.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
        ]}
        , [User1.id]: {continent: []}
      }
      , food: 10
      , status: {
        turn: 0
        , round: 0
        , player: 0
        , phase: PHASE.FEEDING
      }
    });

    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    clientStore0.dispatch(gameEndTurnRequest());
    clientStore1.dispatch(gameEndTurnRequest());
    clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id));
    clientStore0.dispatch(gameEndTurnRequest());

    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().food).equal(8);
  });

  it('Hunting', () => {
    const [{serverStore, ServerGame, CreateGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
    CreateGame({
      players: {
        [User0.id]: {continent: [
          AnimalModel.new(User0.id).set('traits', List.of(
            TraitModel.new('TraitCarnivorous')
          ))
          , AnimalModel.new(User0.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
          , AnimalModel.new(User0.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
        ]}
        , [User1.id]: {continent: [
          AnimalModel.new(User1.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
          , AnimalModel.new(User1.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
          , AnimalModel.new(User1.id).set('traits', List.of(TraitModel.new('TraitCarnivorous')))
        ]}
      }
      , food: 10
      , status: {
        turn: 0
        , round: 0
        , player: 0
        , phase: PHASE.FEEDING
      }
    });

    clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 0).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    ));

    expect(ServerGame().food).equal(10);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().players.get(User1.id).continent.size).equal(2);


    expectUnchanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 1).id, 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectUnchanged(() => clientStore0.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User0, 0).id)), serverStore, clientStore0, clientStore1);
    expectUnchanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 0).id)), serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() => clientStore1.dispatch(traitTakeFoodRequest(ClientGame0().getPlayerAnimal(User1, 1).id)), serverStore, clientStore0, clientStore1);

    clientStore1.dispatch(gameEndTurnRequest());

    expectUnchanged(() => clientStore1.dispatch(traitActivateRequest(
      ClientGame1().getPlayerAnimal(User1, 1).id, 'TraitCarnivorous'
      , ClientGame1().getPlayerAnimal(User0, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectUnchanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 0).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    expectChanged(() => clientStore0.dispatch(traitActivateRequest(
      ClientGame0().getPlayerAnimal(User0, 1).id
      , 'TraitCarnivorous'
      , ClientGame0().getPlayerAnimal(User1, 0).id
    )), serverStore, clientStore0, clientStore1);

    clientStore0.dispatch(gameEndTurnRequest());

    expectChanged(() => clientStore1.dispatch(traitActivateRequest(
      ServerGame().getPlayerAnimal(User1, 0).id
      , 'TraitCarnivorous'
      , ServerGame().getPlayerAnimal(User0, 2).id
    )), serverStore, clientStore0, clientStore1);

    expect(ServerGame().food).equal(9);
    expect(ServerGame().getPlayerAnimal(User0, 0).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User0, 1).food).equal(2);
    expect(ServerGame().getPlayerAnimal(User1, 0).food).equal(2);
    expect(ServerGame().players.get(User0.id).continent.size).equal(2);
    expect(ServerGame().players.get(User1.id).continent.size).equal(1);
  });
});