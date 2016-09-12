import React from 'react';
import {List, Map} from 'immutable';
import {Game, GameView} from './Game.jsx';

import {UserModel} from '../../../shared/models/UserModel';
import {RoomModel} from '../../../shared/models/RoomModel';
import {GameModel, GameModelClient} from '../../../shared/models/game/GameModel';
import {CardModel} from '../../../shared/models/game/CardModel';
import {roomCreateRequest, roomJoinRequest, gameCreateRequest, gameReadyRequest} from '../../../shared/actions/actions';

describe('Game', () => {
  //describe('Empty Navigation', () => {
  //  const clientStore0 = mockClientStore();
  //  const $Game = shallow(<GameView store={clientStore0}/>).shallow();
  //  //expect('asdf').ok;
  //});

    it('Displays default game', () => {
      const [serverStore, {clientStore0, User0}, {clientStore1, User1}] = mockStores(2);
      clientStore0.dispatch(roomCreateRequest());
      const roomId = serverStore.getState().get('rooms').first().id;
      clientStore0.dispatch(roomJoinRequest(roomId));
      clientStore1.dispatch(roomJoinRequest(roomId));
      clientStore0.dispatch(gameCreateRequest(roomId));
      clientStore0.dispatch(gameReadyRequest());
      clientStore1.dispatch(gameReadyRequest());

      const $Game = shallow(<GameView store={clientStore0}/>).shallow();

      expect($Game.find({name: 'Deck'}).props().count, 'Deck.count > 0').above(0);
      expect($Game.find({name: 'Hand'}).props().cards.size, 'Hand.size > 0').above(0);

      //console.log(clientStore0.getState().get('game'))
      //console.log($Game.debug())
      //console.log($Game.find({name: 'Hand'}).props().cards.size)
    });
});