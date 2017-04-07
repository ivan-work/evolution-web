export function ActionCheckError(name, message, ...data) {
  this.name = name;
  this.message = message;
  this.data = data;
  this.stack = (new Error()).stack;
}

ActionCheckError.prototype = new Error;