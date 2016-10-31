export * from './auth';
export * from './rooms';
export * from './game';
export * from './trait';
export * from './debug';
export * from './generic';
export {rqActionAsk} from '../utils/reduxQuestion';

import {rqClientToServer} from '../utils/reduxQuestion';
import {rqServerToClient} from '../utils/reduxQuestion';
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
import {debugClientToServer} from './debug';
import {debugServerToClient} from './debug';

export const clientToServer = Object.assign({}
  , genericServerToClient
  , rqClientToServer
  , authClientToServer
  , roomsClientToServer
  , gameClientToServer
  , traitClientToServer
  , debugClientToServer
  , {$unprotected: []}
);

export const serverToClient = Object.assign({}
  , genericServerToClient
  , rqServerToClient
  , authServerToClient
  , roomsServerToClient
  , gameServerToClient
  , traitServerToClient
  , debugServerToClient
);