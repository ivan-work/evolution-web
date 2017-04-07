//import {User, UserRecord} from '~/shared/models/User';
//import {Map} from 'immutable';
//import {login, logout} from './auth';
//
//const user0 = User('user0');
//const user1 = User('user1');
//
//describe('auth', () => {
//  describe('.login', () => {
//    it('valid/empty', () => {
//      const state = Map();
//      const [nextState, user0] = login(state, 'user0');
//      expect(nextState).to.equal(
//        state.set(user0.id, user0)
//      );
//    });
//    it('valid/many', () => {
//      const state = Map().set(user0.id, user0);
//      const [nextState, user1] = login(state, 'user1');
//      expect(nextState).to.equal(
//        state
//          .set(user0.id, user0)
//          .set(user1.id, user1)
//      );
//    });
//    it('valid/same', () => {
//      const state = Map().set(user0.id, user0);
//      const [nextState, userNew] = login(state, 'user0');
//      expect(nextState).to.equal(
//        state.set(user0.id, user0)
//      );
//    });
//  });
//  describe('.logout', () => {
//    it('valid/empty', () => {
//      const state = Map();
//      const nextState = logout(state, 'user0');
//      expect(nextState).to.equal(Map());
//    });
//    it('valid/one', () => {
//      const state = Map().set(user0.id, user0);
//      const nextState = logout(state, user0.id);
//      expect(nextState).to.equal(Map());
//    });
//    it('valid/many', () => {
//      const state = Map()
//        .set(user0.id, user0)
//        .set(user1.id, user1);
//      const nextState = logout(state, user0.id);
//      expect(nextState).to.equal(Map()
//        .set(user1.id, user1));
//    });
//  });
//});