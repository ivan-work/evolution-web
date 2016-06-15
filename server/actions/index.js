export * from './auth';

import {client as authClient} from './auth';

export const clientActions = Object.assign({}, authClient);
