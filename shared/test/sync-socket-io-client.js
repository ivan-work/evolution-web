import EventEmitter from 'events';
import uuid from 'node-uuid';
import {normalizeNamespace} from './sync-socket-io';

class SyncSocketIOClient extends EventEmitter {
  constructor(server, namespace) {
    super();
    this.id = uuid.v4().substr(0, 4);
    this.rooms = [];
    this._tempNamespace = namespace;

    this.fromServer = super.emit;
    if (server) {
      this.connect(server, namespace);
    }
  }

  connect(server, namespace = '/') {
    if (this.connected) {
      throw new Error('already connected!');
    }
    this.server = server.server;
    this.connected = true;

    [this.id, namespace, this._tempNamespace]
      .filter(name => name != void 0)
      .map(room => this.join(room));

    this.server.fromClient('connect', this);
    this.emit('connect', this);
    this.fromServer('connect');
    return this;
  }

  disconnect(reason) {
    this.server.fromClient('disconnect', this, reason);
    this.emit('disconnect', this, reason);
    this.rooms.forEach(room => this.leave(room));
    this.server = null;
    this.connected = false;
    this.fromServer('disconnect');
    return this;
  }

  join(namespace) {
    namespace = normalizeNamespace(namespace);
    if (!~this.rooms.indexOf(namespace)) {
      //console.log(`${this.id} joins ${namespace}`);
      this.rooms.push(namespace);
    }
    return this;
  }

  leave(namespace) {
    this.rooms = this.rooms.remove(namespace);
    return this;
  }

  emit(...args) {
    this.rooms.map((room) => {
      this.server.of(room).fromClient(...args);
    });
    return this;
  }
}

export default (...args) => new SyncSocketIOClient(...args);

export const SyncSocket = SyncSocketIOClient;