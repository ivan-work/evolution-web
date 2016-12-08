import EventEmitter from 'events';
import uuid from 'uuid';
import {normalizeNamespace} from './sync-socket-io';

class SyncSocketIOClientSocket extends EventEmitter {
  constructor(client) {
    super();
    this.client = client;
  }

  emitSelf(...args) {
    //console.trace('Socket: Emitting: ', this.client.rooms, args[0], (args[1] != this) ? args[1] : '<socket>');
    super.emit(...args);
  }

  emit(...args) {
    this.client.emitSelf(...args);
  }
}

class SyncSocketIOClient extends EventEmitter {
  constructor(server) {
    super();
    this.id = uuid.v4().substr(0, 6);

    this.socket = new SyncSocketIOClientSocket(this);

    this.rooms = [];

    if (server) {
      this.connect(server);
    }
  }

  emitSelf(...args) {
    super.emit(...args.map(arg => JSON.parse(JSON.stringify(arg))));
  }

  emit(...args) {
    //console.log('Client: Emitting: ', this.rooms, args[0], (args[1] != this.socket) ? args[1] : '<socket>');
    this.socket.emitSelf(...args);
    return this;
  }

  connect(server, namespace = '/') {
    if (this.connected) {
      throw new Error('already connected!');
    }
    this.server = server.server;
    this.connected = true;
    this.socket.id = uuid.v4().substr(0, 6);

    [this.id, normalizeNamespace(namespace)]
      .filter(name => name != void 0)
      .map(room => this.join(room));

    this.emitSelf('connect');

    return this;
  }

  disconnect(reason) {
    this.rooms.slice().forEach(room => {
      this.leave(room, reason)
    });

    this.socket.emitSelf('disconnect', reason);
    this.emitSelf('disconnect');

    this.server = null;
    this.connected = false;

    this.socket.removeAllListeners();
    //this.removeAllListeners();

    return this;
  }

  join(namespace) {
    namespace = normalizeNamespace(namespace);
    if (!~this.rooms.indexOf(namespace)) {
      //console.log(`${this.id} joins ${namespace}`);
      this.rooms.push(namespace);
      this.server.of(namespace).emitSelf('connect', this.socket);
    }
    return this;
  }

  leave(namespace, reason) {
    namespace = normalizeNamespace(namespace);
    this.server.of(namespace).emitSelf('disconnect', this.socket, reason);
    this.rooms = this.rooms.remove(namespace);
    return this;
  }
}

export default (...args) => new SyncSocketIOClient(...args);

export const SyncSocketClient = SyncSocketIOClient;