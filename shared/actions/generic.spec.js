import {
  server$askQuestion
  , testAction
  //, gameEndTurnRequest
  //, traitTakeFoodRequest
  //, traitActivateRequest
  //, SOCKET_DISCONNECT_NOW
} from './generic';

describe.only('Generic actions', () => {
  it('Promises', () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 0
deck: 36 camo
`);
    serverStore.dispatch(server$askQuestion(testAction('question?')))
      .then((data) => {
        expect(data).equal('testquestion?');
      });
  });
});