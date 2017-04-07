//import React from 'react';
//import {List, Map, Range} from 'immutable';
//import {CardCollection} from './CardCollection.jsx';
//
////import {UserModel} from '../../../shared/models/UserModel';
////import {RoomModel} from '../../../shared/models/RoomModel';
////import {GameModel, GameModelClient} from '../../../shared/models/game/GameModel';
//import {CardModel} from '../../../shared/models/game/CardModel';
////import {roomCreateRequest, roomJoinRequest, gameStartRequest, gameReadyRequest} from '../../../shared/actions/actions';
//
//describe('Game', () => {
//  describe('Empty State', () => {
//    it('Displays name', () => {
//      const cards = CardModel.generate(12);
//      //const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
//      //clientStore0.dispatch(roomCreateRequest());
//      //const roomId = serverStore.getState().get('rooms').first().id;
//      //clientStore0.dispatch(roomJoinRequest(roomId));
//      //clientStore1.dispatch(roomJoinRequest(roomId));
//      //clientStore0.dispatch(gameStartRequest(roomId));
//      //clientStore0.dispatch(gameReadyRequest());
//      //clientStore1.dispatch(gameReadyRequest());
//
//      const $CardCollection = shallow(<CardCollection
//          ref="testcc" name="testcc"
//          position={Map({top: 0, left: '50%'})}
//          shift={List.of(-25, 1)}
//          cards={cards}/>);
//
//
//      console.log($CardCollection.debug());
//    });
//  });
//});