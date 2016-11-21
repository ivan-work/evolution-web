import React from 'react';
import {AnimationServiceContext} from './index';

import {configureStore, createTestASContext, addTodo, removeTodo} from './AnimationService.isolated.jsx';

/*
 c0=0
 c0=1
 2s c0=2 | 1s c1=1
 2s c0=3 | 1s
 */

const TestASContext = createTestASContext(({subscribe, getRef}) => {
  subscribe('ADD', (done, props, actionData) => setTimeout(done, 10));
  subscribe('REMOVE', (done, props, actionData) => setTimeout(done, 10));
});


describe.only('AnimationService2', () => {
  it('Simple actions', async () => {
    const store = configureStore();
    const $Client = mount(<TestASContext getState={store.getState}/>);
    let id = 0;
    const dummyAction = () => ({type: 'DUMMY', data: null});
    store.subscribe(() => $Client.update());

    store.dispatch(dummyAction());
    store.dispatch(addTodo(++id, 'test1'));
    store.dispatch(addTodo(++id, 'test2'));
    expect($Client.find('.TestASRef')).length(1);
    await new Promise(resolve => setTimeout(resolve, 6));
    expect($Client.find('.TestASRef')).length(1);
    await new Promise(resolve => setTimeout(resolve, 6));
    expect($Client.find('.TestASRef')).length(2);
  });
});