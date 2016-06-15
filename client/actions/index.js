export * from './auth';

import {server as authServer} from './auth';

export const serverActions = Object.assign({}, authServer);