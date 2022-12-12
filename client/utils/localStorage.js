export const loadValue = (key, defValue) => {
  let value = null;
  if (!process.env.TEST) {
    try {
      value = JSON.parse(window.localStorage.getItem(key));
    } catch (e) {
      window.localStorage.removeItem(key);
    }
    return value !== null ? value : defValue;
  }
};

export const loadJSONValue = (key, defValue) => {
  let value = null;
  if (!process.env.TEST) {
    try {
      value = JSON.parse(window.localStorage.getItem(key));
    } catch (e) {
      window.localStorage.removeItem(key);
    }
    return value !== null ? value : defValue;
  }
};

export const saveValue = (key, value) => {
  if (!process.env.TEST) window.localStorage.setItem(key, JSON.stringify(value));
  return value;
};