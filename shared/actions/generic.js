export const actionError = (userId, error) => ({
  type: 'actionError'
  , data: {error}
  , meta: {userId}
});

export const genericClientToServer = {
};
export const genericServerToClient = {
  actionError: (data) => {
    console.log('data', data)
    return actionError(null, data.error)
  }
};