import {ObjectID} from 'mongodb';
import {List} from 'immutable';
import {Lobby, LobbyRecord} from './Lobby'
import {User} from './User'

describe('Lobby', () => {
  it('.new', () => {
    const lobby = Lobby('test', 3);
    expect(lobby.name).equal('test');
    expect(lobby.maxSize).equal(3);
  });
  describe('.join', () => {
    it('one', () => {
      const lobby = Lobby('test');
      const user0 = User('user0');
      expect(lobby.join(user0)).to.eql(new LobbyRecord({
        id: lobby.id
        , name: 'test'
        , maxSize: 4
        , users: List.of(user0)
      }));
    });
    it('two', () => {
      const lobby = Lobby('test', 2);
      const user0 = new User('user0');
      const user1 = new User('user1');
      const lobby1 = lobby.join(user0);
      const lobby2 = lobby.join(user0).join(user1);
      expect(lobby1).to.equal(new LobbyRecord({
        id: lobby.id
        , name: 'test'
        , maxSize: 2
        , users: List.of(user0)
      }));
      expect(lobby2).to.equal(new LobbyRecord({
        id: lobby.id
        , name: 'test'
        , maxSize: 2
        , users: List.of(user0, user1)
      }));
    });
    it('two', () => {
      const lobby = Lobby('test', 2);
      const user0 = new User('user0');
      const user1 = new User('user1');
      const lobby1 = lobby.join(user0);
      const lobby2 = lobby.join(user0).join(user1);
      expect(lobby1).to.equal(new LobbyRecord({
        id: lobby.id
        , name: 'test'
        , maxSize: 2
        , users: List.of(user0)
      }));
      expect(lobby2).to.equal(new LobbyRecord({
        id: lobby.id
        , name: 'test'
        , maxSize: 2
        , users: List.of(user0, user1)
      }));
    });
    it('maxSize = 2, third joins', () => {
      const lobby = Lobby('test', 2);
      const user0 = new User('user0');
      const user1 = new User('user1');
      const user2 = new User('user2');
      const lobby1 = lobby.join(user0);
      const lobby2 = lobby.join(user0).join(user1);
      expect(() => lobby2.join(user2)).to.throw('max_size');
    });
  });
  //it('.size', () => {
  //  const lobby = Lobby('test', 2);
  //  const lobby1 = lobby.join(new User('user0'));
  //  const lobby2 = lobby.join(new User('user1'));
  //  expect(lobby.size()).equal(0);
  //});
  //it('immutable', () => {
  //  let user = User('user0');
  //  expect(user.id).to.equal('3d517fe6ebab7b8cfcf98db6259c8a59');
  //  expect(() => user.id = '123').to.throw('immutable');
  //  expect(user.id).to.equal('3d517fe6ebab7b8cfcf98db6259c8a59');
  //  let user1 = user.set('name', 'user1');
  //  expect(user.name).to.equal('user0');
  //  expect(user1.name).to.equal('user1');
  //  expect(user.name).to.not.equal(user1);
  //});
});