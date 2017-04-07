export * from 'auth';

import {clientToServer as authClientToServer} from './auth';
import {serverToClient as authServerToClient} from './auth';

export const clientToServer = Object.assign({}
  , authClientToServer);

export const serverToClient = Object.assign({}
  , authServerToClient);