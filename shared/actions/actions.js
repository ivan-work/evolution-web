export * from './auth';
export * from './rooms';
export * from './game';
export * from './trait';

import {genericClientToServer} from './generic';
import {genericServerToClient} from './generic';
import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
import {roomsClientToServer} from './rooms';
import {roomsServerToClient} from './rooms';
import {gameClientToServer} from './game';
import {gameServerToClient} from './game';
import {traitClientToServer} from './trait';
import {traitServerToClient} from './trait';

export const clientToServer = Object.assign({}
  , genericServerToClient
  , authClientToServer
  , roomsClientToServer
  , gameClientToServer
  , traitClientToServer
  , {$unprotected: []}
);

export const serverToClient = Object.assign({}
  , genericServerToClient
  , authServerToClient
  , roomsServerToClient
  , gameServerToClient
  , traitServerToClient
);