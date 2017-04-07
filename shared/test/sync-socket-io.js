import EventEmitter from 'events';

class SyncSocketIORoom extends EventEmitter {
  constructor(server, namespace) {
    super();
    this.server = server;
    this.namespace = namespace;
    this.clients = [];
    this.fromClient = super.emit;
    this.on('connect', (client) => {
      //console.log(`room (${this.namespace}): client ${client.id} connected, ${this.clients.indexOf(client)}`);
      if (!~this.clients.indexOf(client)) this.clients.push(client);
      //console.log(`room (${this.namespace}:${this.clients.map(c => c.id).join(',')}:${this.clients.length})`);
    });
    this.on('disconnect', (client) => {
      //console.log(`room (${this.namespace}): client ${client.id} disconnect, ${this.clients.indexOf(client)}`);
      //console.log(`room (${this.namespace}:${this.clients.map(c => c.id).join(',')}:${this.clients.length})`);
      this.clients = this.clients.remove(client);
      //console.log(`room (${this.namespace}:${this.clients.map(c => c.id).join(',')}:${this.clients.length})`);
    });
  }

  emit(...data) {
    this.clients.forEach(client => {
      client.fromServer(...data);
    })
  }
}

class SyncSocketIO extends SyncSocketIORoom {
  constructor() {
    super();
    this.namespace = '$root';
    this.server = this;
    this.rooms = {};
  }

  of(namespace, onConnect) {
    namespace = normalizeNamespace(namespace);
    if (!this.rooms[namespace])  {
      this.rooms[namespace] = new SyncSocketIORoom(this.server, namespace);
    }

    if (onConnect) this.rooms[namespace].on('connect', onConnect);

    return this.rooms[namespace];
  }
}

export default (...args) => new SyncSocketIO(...args);

export const SyncSocketServer = SyncSocketIO;

export const normalizeNamespace = namespace => namespace.startsWith('/') ? namespace : '/' + namespace;