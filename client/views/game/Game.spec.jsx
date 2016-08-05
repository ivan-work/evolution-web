//import React from 'react';
//import {List, Map} from 'immutable';
//import {Game, GameView} from './Game.jsx';
//
//import {UserModel} from '../../../shared/models/UserModel';
//import {RoomModel} from '../../../shared/models/RoomModel';
//import {GameModel, GameModelClient} from '../../../shared/models/game/GameModel';
//import {CardModel} from '../../../shared/models/game/CardModel';
//import {roomCreateRequest, roomJoinRequest, gameStartRequest, gameReadyRequest} from '../../../shared/actions/actions';
//
//describe('Game', () => {
//  describe('Empty State', () => {
//    it('Displays name', () => {
//      const mockState = {
//        getState: () => Map({
//          user: new UserModel({id: 'user0'})
//          , game: new GameModel({
//
//          })
//        })
//      };
//      const $Game = shallow(<GameView store={mockState}/>).shallow();
//
//      console.log($Game.debug());
//    });
//  });
//  //describe('Empty State', () => {
//  //  it('Displays name', () => {
//  //    const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
//  //    clientStore0.dispatch(roomCreateRequest());
//  //    const roomId = serverStore.getState().get('rooms').first().id;
//  //    clientStore0.dispatch(roomJoinRequest(roomId));
//  //    clientStore1.dispatch(roomJoinRequest(roomId));
//  //    clientStore0.dispatch(gameStartRequest(roomId));
//  //    clientStore0.dispatch(gameReadyRequest());
//  //    clientStore1.dispatch(gameReadyRequest());
//  //
//  //    const $Game = shallow(<GameView store={clientStore0}/>).shallow();
//  //
//  //    console.log($Game.debug());
//  //  });
//  //});
//});