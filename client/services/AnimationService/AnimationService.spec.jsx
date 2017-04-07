import React from 'react';
import {AnimationServiceContext} from './index';

import {setCounter, configureStore, SIZE, TestAS, TestASRef} from './AnimationService.isolated.jsx';

/*
 c0=0
 c0=1
 2s c0=2 | 1s c1=1
 2s c0=3 | 1s
 */

const TestASContext = AnimationServiceContext({
  animations: ({subscribe, getRef}) => {
    subscribe('setCounter2', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 2 DONE');
      done();
    }, 5));
    subscribe('setCounter3', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 3 DONE');
      done();
    }, 5));
    subscribe('setCounter4', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 4 DONE');
      done();
    }, 5));
    subscribe('setCounter5', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 5 DONE');
      done();
    }, 5));
  }
})(TestAS);


describe.only('AnimationService2', () => {
  it('Simple actions', async () => {
    const store = configureStore();
    const $Client = mount(<TestASContext getState={store.getState}/>);
    store.subscribe(() => $Client.update());

    const CheckState = (getState, current) => {
      //console.log('CheckState for', current);
      expect(getState(), `CheckState: Valid: ${current}, Real: ${getState()}, `).equal(current);
      CheckClient(current);
    };
    const CheckClient = (current) => Array.from({length: SIZE}).map((u, i) =>
      expect($Client.find('.TestASRef').at(i).text(), `Checking: ${i}, valid: ${current}`)[current === i ? 'to' : 'not'].equal('CURRENT')
    );

    store.dispatch(setCounter(1));
    store.dispatch(setCounter(2));
    store.dispatch(setCounter(3));
    store.dispatch(setCounter(4));
    store.dispatch(setCounter(5));

    CheckState(store.getState, 2);
    console.log('state: 2, wait start');
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log('state: 3, wait end');
    CheckState(store.getState, 3);
    CheckClient(3);
    console.log('state: 3, wait start');
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log('state: 4, wait end');
    CheckState(store.getState, 4);
    CheckClient(4);
    console.log('state: 4, wait start');
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log('state: 5, wait end');
    CheckState(store.getState, 5);
    CheckClient(5);
  });
});