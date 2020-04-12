export function ActionCheckError(name, message, ...data) {
  this.type = 'ActionCheckError';
  this.name = name;
  this.message = (data || []).reduce((str, item) => str.replace(/%s/, item), message);
  this.data = data;
  this.stack = (new Error()).stack;
}

ActionCheckError.prototype = new Error;