function ActionCheckError(name, context = {}) {
  this.type = 'ActionCheckError';
  this.userLevelError = true;
  this.name = name;
  this.message = name + JSON.stringify(context);
  this.context = context;
  this.stack = (new Error()).stack;
}

ActionCheckError.prototype = new Error;

export default ActionCheckError;