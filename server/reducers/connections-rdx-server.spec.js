//import {Map, fromJS} from 'immutable';
//import {socketConnect, socketDisconnect} from '../../shared/actions/actions';
//import {reducer} from './connections';
//
//describe('Reducer: connections', () => {
//  it('socketConnect', () => {
//    const state = Map();
//    const nextState = reducer(state, socketConnect('id', 'socket'));
//    expect(nextState).to.equal(fromJS({
//      'id': 'socket'
//    }));
//  });
//  it('socketDisconnect', () => {
//    const state = fromJS({
//      'id': 'socket'
//    });
//    const nextState = reducer(state, socketDisconnect('id'));
//    expect(nextState).to.equal(Map());
//  });
//});