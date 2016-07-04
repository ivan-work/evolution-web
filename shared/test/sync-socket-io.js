import EventEmitter from 'events';

class SyncSocketIO extends EventEmitter {
  constructor(server, namespace = '/') {
    super();
    this.rooms = {'/': this};
    this.server = server || this;
    this.namespace = normalizeNamespace(namespace);
    this.sockets = [];

    this.on('connect', (socket) => {
      //console.log(`room (${this.namespace}): client ${client.id} connected, ${this.sockets.indexOf(client)}`);
      if (!~this.sockets.indexOf(socket)) {
        this.sockets.push(socket);
      }
      //console.log(`room (${this.namespace}:${this.sockets.map(c => c.id).join(',')}:${this.sockets.length})`);
    });
    this.on('disconnect', (socket) => {
      //console.log(`room (${this.namespace}): client ${client.id} disconnect, ${this.sockets.indexOf(socket)}`);
      //console.log(`room (${this.namespace}:${this.sockets.map(c => c.id).join(',')}:${this.sockets.length})`);
      this.sockets = this.sockets.remove(socket);
      //console.log(`room (${this.namespace}:${this.sockets.map(c => c.id).join(',')}:${this.sockets.length})`);
    });
  }

  emitSelf(...args) {
    //console.log(`Room (${this.namespace}): Emitting to self`, args[0]);
    super.emit(...args);
    return this;
  }

  emit(...data) {
    this.sockets.forEach(socket => {
      socket.emit(...data);
    })
  }

  of(namespace, onConnect) {
    namespace = normalizeNamespace(namespace);
    if (!this.server.rooms[namespace]) {
      this.server.rooms[namespace] = new SyncSocketIO(this.server, namespace);
    }

    if (onConnect) this.server.rooms[namespace].on('connect', onConnect);

    return this.server.rooms[namespace];
  }
}

export default (...args) => new SyncSocketIO(null);

export const SyncSocketServer = SyncSocketIO;

export const normalizeNamespace = namespace => namespace.startsWith('/') ? namespace : '/' + namespace;