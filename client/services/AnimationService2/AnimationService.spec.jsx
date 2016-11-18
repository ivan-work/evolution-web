import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {animationMiddleware, AnimationServiceContext, AnimationServiceRef} from './index';

const ACTIONS = 8;
const setCounter = (counterId, counterValue = 1) => ({type: 'setCounter' + counterId, data: {counterId, counterValue}});
const reducer = (state, action) => {
  if (action.type.startsWith('setCounter')) {
    console.log(`reduce ${state} > ${action.type}`)
    state = action.data.counterId;
  }
  return state;
};

const TestASRef = AnimationServiceRef(({getState, id, connectRef}) => <div className='TestASRef'
                                                                           ref={connectRef(id)}>{getState() === id ? 'CURRENT' : null}</div>);

/*
 c0=0
 c0=1
 2s c0=2 | 1s c1=1
 2s c0=3 | 1s
 */


const TestASContext = AnimationServiceContext({
  animations: ({subscribe, getRef}) => {
    subscribe('setCounter0', (done, props, actionData) => {
      console.log('ANIMATION 0 DONE');
      done()
    });
    subscribe('setCounter2', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 2 DONE');
      done();
    }, 5));
    subscribe('setCounter3', (done, props, actionData) => setTimeout(() => {
      console.log('ANIMATION 3 DONE');
      done();
    }, 5));
    subscribe('setCounter5', (done, props, actionData) => {
      console.log('ANIMATION 5 DONE');
      done()
    });
    subscribe('setCounter6', (done, props, actionData) => {
      console.log('ANIMATION 6 DONE');
      done()
    });
  }
})(({getState}) => <div>
  {Array.from({length: ACTIONS}).map((u, i) => <TestASRef key={i} id={i} getState={getState}/>)}
</div>);

describe.only('AnimationService2', () => {
  it('works', async () => {
    const store = createStore(reducer, 0, applyMiddleware(animationMiddleware()))
    const $Client = mount(<TestASContext getState={store.getState}/>);
    store.subscribe(() => $Client.update());

    const CheckClient = (current) => Array.from({length: ACTIONS}).map((u, i) =>
      expect($Client.find('.TestASRef').at(i).text(), `Checking: ${i}, valid: ${current}`)[current === i ? 'to' : 'not'].equal('CURRENT')
    );
    const CheckState = (current) => {
      console.log('CheckState for', current);
      expect(store.getState(), `CheckState: Valid: ${current}, Real: ${store.getState()}, `).equal(current);
      //CheckClient(current);
    };


    store.dispatch(setCounter(0));
    CheckState(0);
    store.dispatch(setCounter(1));
    await new Promise(resolve => setTimeout(resolve, 0));
    CheckState(1);
    store.dispatch(setCounter(2));
    store.dispatch(setCounter(3));
    store.dispatch(setCounter(4));
    store.dispatch(setCounter(5));
    store.dispatch(setCounter(6));
    store.dispatch(setCounter(7));
    await new Promise(resolve => setTimeout(resolve, 0));
    CheckState(2);
    await new Promise(resolve => setTimeout(resolve, 5));
    CheckState(3);
    await new Promise(resolve => setTimeout(resolve, 9));
    CheckState(7);
  });
});