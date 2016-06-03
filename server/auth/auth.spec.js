import {User} from '../../shared/models/User';
import {Map, fromJS} from 'immutable';
import {login, logout} from './auth';

const user0 = User('user0');
const user1 = User('user1');

describe('auth', () => {
  describe('.login', () => {
    it('valid/empty', () => {
      const state = Map();
      const nextState = login(state, 'user0');
      expect(nextState).to.equal(fromJS({[user0.id]: user0}));
    });
    it('valid/many', () => {
      const state = fromJS({[user0.id]: user0});
      const nextState = login(state, 'user1');
      expect(nextState).to.equal(fromJS({
        [user0.id]: user0
        , [user1.id]: user1
      }));
    });
    it('valid/same', () => {
      const state = fromJS({[user0.id]: user0});
      const nextState = login(state, 'user0');
      expect(nextState).to.equal(fromJS({[user0.id]: user0}));
    });
  });
  describe('.logout', () => {
    it('valid/empty', () => {
      const state = Map();
      const nextState = logout(state, 'user0');
      expect(nextState).to.equal(Map());
    });
    it('valid/one', () => {
      const state = fromJS({[user0.id]: user0});
      const nextState = logout(state, 'user0');
      expect(nextState).to.equal(Map());
    });
    it('valid/many', () => {
      const state = fromJS({
        [user0.id]: user0
        , [user1.id]: user1
      });
      const nextState = logout(state, 'user0');
      expect(nextState).to.equal(fromJS({
        [user1.id]: user1
      }));
    });
  });
});