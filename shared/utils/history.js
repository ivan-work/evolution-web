let history = {
  push() {
    // console.error('history not set')
  }
};

export const setHistory = (input) => history = input;

export function redirectTo(...args) {
  return history.push(...args);
}
