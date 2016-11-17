import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {animationMiddleware, AnimationServiceContext, AnimationServiceRef} from './index';

const ACTIONS = 5;
const setCounter = (counterId, counterValue) => ({type: 'setCounter', data: {counterId, counterValue}});
const reducer = (state, action) => {
  state[action.data.counterId] = action.data.counterValue;
  return state;
};

const TestASRef = AnimationServiceRef(({getState, id, connectRef}) => <div className='TestASRef' ref={connectRef(id)}>{getState() === id ? 'CURRENT' : null}</div>);

/*
c0=0
c0=1
2s c0=2 | 1s c1=1
2s c0=3 | 1s
*/



const TestASContext = AnimationServiceContext({
  animations: ({subscribe, getRef}) => {
    subscribe()


    action0: (done, props, data) => setTimeout(done, 1)
    , action1: (done, props, data) => setTimeout(done, 1)
    , action2: (done, props, data) => setTimeout(done, 1)
    , action3: (done, props, data) => setTimeout(done, 1)
    , action4: (done, props, data) => setTimeout(done, 1)
  }
})(({getState}) => <div>
  {Array.from({length: ACTIONS}).map((u, i) => <TestASRef key={i} id={i} getState={getState}/>)}
</div>);

describe.only('AnimationService2', () => {
  it('works', async () => {
    const store = createStore(reducer, 0, applyMiddleware(animationMiddleware()))
    const $Client = mount(<TestASContext getState={store.getState}/>);
    store.subscribe(() => $Client.update());

    const CheckCurrent = (current) => Array.from({length: ACTIONS}).map((u, i) =>
      expect($Client.find('.TestASRef').at(i).text())[current === i ? 'to' : 'not'].equal('CURRENT')
    );


    store.dispatch(action(0));
    CheckCurrent(0);
    store.dispatch(action(1));
    CheckCurrent(1);
  });
});