import {User} from './User';

describe('User', () => {
  it('new', () => {
    const user = User('user0');
    expect(User('user0').name).to.equal('user0');
    expect(User('user1').name).to.equal('user1');
    expect(User('user1')).to.not.equal(User('user1'));
    expect(User('user1')).to.not.equal(User('user0'));
    expect(user).to.equal(user);
  });
  it('immutable', () => {
    let user = User('user0');
    expect(() => user.id = '123').to.throw('immutable');
    let user1 = user.set('name', 'user1');
    expect(user.name).to.equal('user0');
    expect(user1.name).to.equal('user1');
    expect(user).to.not.equal(user1);
    expect(user.id).to.equal(user1.id);
  });
});