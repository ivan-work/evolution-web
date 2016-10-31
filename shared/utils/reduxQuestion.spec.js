import {
  rqActionAsk
  //, gameEndTurnRequest
  //, traitTakeFoodRequest
  //, traitActivateRequest
  //, SOCKET_DISCONNECT_NOW
} from '../actions/actions';

describe.only('Generic actions', () => {
  it('Promises', async () => {
    const [{serverStore, ParseGame}, {clientStore0, User0}, {clientStore1, User1}] = mockGame(2);
    const gameId = ParseGame(`
phase: 0
deck: 36 camo
`);
    const testAction = {
      type: 'testAction'
      , data: 'question?'
      , meta: {users: true}
    };
    let answer;

    answer = await serverStore.dispatch(rqActionAsk(testAction));
    expect(answer, 'ask').equal('testquestion?');

    answer = await serverStore.dispatch(rqActionAsk(testAction, 10));
    expect(answer, 'ask, 10').equal('testquestion?');

    answer = await serverStore.dispatch(rqActionAsk({type: 'undefined'}, 10));
    expect(answer, 'void 0, 10').equal(null);
  });
});