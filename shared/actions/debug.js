//export const debugQuestionExclamation = (data) => ({
//  type: 'debugQuestionExclamation'
//  , data: data
//  , meta: {users: true}
//});

export const debugClientToServer = {
};

export const debugServerToClient = {
};

export const clientOnQuestion = {
  debugQuestionExclamation: (data) => data + '!!!'
};