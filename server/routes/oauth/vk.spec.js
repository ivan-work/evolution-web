import OauthVK from './vk';
// import {loginRegister} from './loginRegister';

describe('VK Oauth', () => {
  describe('Parsing', () => {
    it('Parse User response', () => {
      expect(OauthVK.parseUser({'response':[{'uid':123,'first_name':'abc11абв','last_name':'LOLЛол123'}]})).eql({
        id: 123
        , name: 'abc11абв LOLЛол123'
      });
    });
  });

  describe('Parsing.Hack', () => {
    it('Validate response', () => {
      expect(() => OauthVK.parseUser({'response':[{'uid': 1,'last_name':'X'}]})).to.throw(Error);
      expect(() => OauthVK.parseUser({'response':[{'first_name': 'X','last_name':'X'}]})).to.throw(Error);
      expect(() => OauthVK.parseUser({'response':[{'uid': 1,'first_name': 'X'}]})).to.throw(Error);
      expect(() => OauthVK.parseUser({'response':[]})).to.throw(Error);
      expect(() => OauthVK.parseUser({})).to.throw(Error);
      expect(() => OauthVK.parseUser()).to.throw(Error);
    });

    it('Validate id', () => {
      expect(() => OauthVK.parseUser({'response':[{'uid': NaN,'first_name':'X','last_name':'X'}]})).to.throw(Error);
      expect(() => OauthVK.parseUser({'response':[{'uid': 'hey','first_name':'X','last_name':'X'}]})).to.throw(Error);
    });

    it('Validate name', () => {
      expect(() => OauthVK.parseUser({'response':[{'uid': 1,'first_name':'','last_name':''}]})).to.throw(Error);
    });

    it('Sanitize name', () => {
      expect(OauthVK.parseUser({'response':[{'uid': 1,'first_name':'  <sc  ri','last_name':'\\pt/>'}]})).eql({
        id: 1
        , name: 'scri pt'
      });
      expect(OauthVK.parseUser({'response':[{'uid': 1,'first_name':'a23456789ABCDEFXXXXXXX','last_name':'a23456789ABCDEFXXXXXXX'}]})).eql({
        id: 1
        , name: 'a23456789ABCDEF a23456789ABCDEF'
      });
    });
  });
});