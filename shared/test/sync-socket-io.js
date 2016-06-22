import EventEmitter from 'events';

class SyncSocketIO extends EventEmitter {
  constructor() {
    super();
  }

  listen(cb) {
    cb();
  }

  of(namespace, onConnect) {
    if (onConnect) this.on('connect', onConnect);
    return this;
  }
}

export default (...args) => new SyncSocketIO(...args);

export const SyncSocketServer = SyncSocketIO;