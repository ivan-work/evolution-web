import EventEmitter from 'events';

class SyncSocketIOClient extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
  }

  connect(server) {
    this.server = server || this.server;
    this.connected = true;
    this.emit('connect');
    this.server.emit('connect', this);
    this.server.emit('connection', this);
  }

  disconnect(reason) {
    this.emit('disconnect')
  }
}

export default (...args) => new SyncSocketIOClient(...args);

export const SyncSocket = SyncSocketIOClient;