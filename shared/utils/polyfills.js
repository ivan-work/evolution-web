Array.prototype.remove = function (argument) {
  const removeFn = (typeof argument === 'function'
    ? argument
    : (item) => item === argument);
  for (var i = 0; i < this.length; i++) {
    if (removeFn(this[i])) {
      this.splice(i, 1);
      break;
    }
  }
  return this;
};

