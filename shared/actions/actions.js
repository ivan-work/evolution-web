export * from './auth';
export * from './rooms';

import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
import {roomsClientToServer} from './rooms';
import {roomsServerToClient} from './rooms';
import {gameClientToServer} from './game';
import {gameServerToClient} from './game';

export const clientToServer = Object.assign({}
  , authClientToServer
  , roomsClientToServer
  , gameClientToServer
  , {$unprotected: []}
);

export const serverToClient = Object.assign({}
  , authServerToClient
  , roomsServerToClient
  , gameServerToClient
);