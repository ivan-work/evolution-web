import {User} from './User'

describe('User', () => {
  it('new', () => {
    expect(User('user0').get('id')).to.equal('3d517fe6ebab7b8cfcf98db6259c8a59');
    expect(User('user0').get('name')).to.equal('user0');
    expect(User('user1').get('id')).to.equal('24c9e15e52afc47c225b757e7bee1f9d');
    expect(User('user1').get('name')).to.equal('user1');
    expect(User('user1')).to.equal(User('user1'));
    expect(User('user1')).to.not.equal(User('user0'));
  });
  it('immutable', () => {
    let user = User('user0');
    expect(user.id).to.equal('3d517fe6ebab7b8cfcf98db6259c8a59');
    expect(() => user.id = '123').to.throw('immutable');
    expect(user.id).to.equal('3d517fe6ebab7b8cfcf98db6259c8a59');
    let user1 = user.set('name', 'user1');
    expect(user.name).to.equal('user0');
    expect(user1.name).to.equal('user1');
    expect(user.name).to.not.equal(user1);
  });
});