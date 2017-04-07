export * from './auth';
export * from './rooms';

import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
import {roomsClientToServer} from './rooms';
import {roomsServerToClient} from './rooms';

export const clientToServer = Object.assign({}
  , authClientToServer
  , roomsClientToServer
);

export const serverToClient = Object.assign({}
  , authServerToClient
  , roomsServerToClient
);