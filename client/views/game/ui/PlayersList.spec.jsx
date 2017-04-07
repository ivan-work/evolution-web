import React from 'react';
import {PlayersList} from './PlayersList.jsx';

import {SOCKET_DISCONNECT_NOW} from '../../../../shared/actions/actions';

describe('PlayersList:', () => {
  it('default:', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}] = mockGame(3);
    ParseGame(``);
      mount(<PlayersList game={ClientGame0()}/>)
  });
  it('with leaver:', () => {
    const [{serverStore, ServerGame, ParseGame}
      , {clientStore0, User0, ClientGame0}
      , {clientStore1, User1, ClientGame1}
      , {clientStore2, User2, ClientGame2}
      , {clientStore3, User3, ClientGame3}] = mockGame(4);
    ParseGame(``);
      clientStore1.disconnect(SOCKET_DISCONNECT_NOW);
      clientStore3.disconnect(SOCKET_DISCONNECT_NOW);
      mount(<PlayersList game={ClientGame0()}/>)
  });
});