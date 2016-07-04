export * from './auth';

import {authClientToServer} from './auth';
import {authServerToClient} from './auth';
export const clientToServer = Object.assign({}
  , authClientToServer
);

export const serverToClient = Object.assign({}
  , authServerToClient
);