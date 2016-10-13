import React from 'react';
import {Root} from '../../client/components/Root.jsx';
import {syncHistoryWithStore} from '../../client/configuration/routing'
import {UserService} from '../../client/services/UserService';

export const mountClient = (store) => {
  UserService.start(store.getState);
  return mount(<Root store={store} history={syncHistoryWithStore(store, store.getHistory())}/>);
};