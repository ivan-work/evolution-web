export class ExtendableError extends Error {
  constructor(message) {
    var err = super(message);
    Object.assign(this, err);
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}