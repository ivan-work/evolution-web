export * from './auth';
export * from './rooms';
export * from './game';

import {genericClientToServer} from './generic';
import {genericServerToClient} from './generic';
import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
import {roomsClientToServer} from './rooms';
import {roomsServerToClient} from './rooms';
import {gameClientToServer} from './game';
import {gameServerToClient} from './game';

export const clientToServer = Object.assign({}
  , genericServerToClient
  , authClientToServer
  , roomsClientToServer
  , gameClientToServer
  , {$unprotected: []}
);

export const serverToClient = Object.assign({}
  , genericServerToClient
  , authServerToClient
  , roomsServerToClient
  , gameServerToClient
);