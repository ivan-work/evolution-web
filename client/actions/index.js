export function login(username) {
  return {
    type: 'LOGIN',
    username,
    meta: {api: true}
  };
}