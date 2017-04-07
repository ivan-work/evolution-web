import io, {SyncSocketServer} from './sync-socket-io';
import ioc, {SyncSocketClient} from './sync-socket-io-client';
import {Map} from 'immutable';

describe('Sync-socket-io:', function () {
  describe('Basic:', function () {
    it('should fire a `connect` event', function () {
      let server = io();
      let client = ioc();
      let clientConnected = 0, serverConnected = 0;
      server.on('connect', (socket) => {
        expect(socket).not.undefined;
        expect(client.socket.id).equal(socket.id);
        serverConnected++;
      });
      client.on('connect', (...args) => {
        clientConnected++;
        expect(args.length).equal(0);
      });
      expect(clientConnected).equal(0);
      expect(serverConnected).equal(0);
      client.connect(server);
      expect(clientConnected, 'clientConnected').equal(1);
      expect(serverConnected, 'serverConnected').equal(1);
    });
    it('should send messages', function () {
      let server = io();
      let client = ioc();
      let messageFromClient
        , messageFromServer;
      client.on('message', (msg) => messageFromServer = msg);

      server.on('connect', (socket) => {
        socket.emit('message', 'msg from server');
        socket.on('message', (msg) => messageFromClient = msg);
      });

      expect(messageFromClient, 'initial messageFromClient').undefined;
      expect(messageFromServer, 'initial messageFromServer').undefined;
      client.connect(server);
      expect(messageFromClient, 'onConnected messageFromClient').undefined;
      expect(messageFromServer, 'onConnected messageFromServer').equal('msg from server');
      client.emit('message', 'msg from client');
      expect(messageFromClient, 'final messageFromServer').equal('msg from client');
    });
    it('should disconnect', function () {
      let server = io();
      let client = ioc();
      let clientConnections = 0
        , serverConnections = 0;
      server.on('connect', () => serverConnections++);
      client.on('connect', () => clientConnections++);
      server.on('disconnect', () => serverConnections--);
      client.on('disconnect', () => clientConnections--);
      expect(clientConnections).equal(0);
      expect(serverConnections, 'serverConnections').equal(0);
      client.connect(server);
      expect(clientConnections).equal(1);
      expect(serverConnections, 'serverConnections').equal(1);
      client.disconnect();
      expect(clientConnections).equal(0);
      expect(serverConnections, 'serverConnections').equal(0);
    });
    it('should stringify data', function () {
      let server = io();
      let client = ioc();
      let object = Map({id: 123});
      server.on('connect', (socket) => {
        socket.emit('object', object);
        socket.on('clientObject', (obj) => {
          expect(obj).eql({id: 123});
        });
      });
      client.on('object', (obj) => {
        expect(obj).eql({id: 123});
      });
      client.connect(server);
      client.emit(object);
    });
  });

  describe('Multiple:', function () {
    it('should connect/disconnect multiple clients w/ messages!', function () {
      let server = io();
      let client1 = ioc();
      let client2 = ioc();
      let client1Connections = 0
        , client2Connections = 0
        , serverConnections = 0;
      let serverMessage = ''
        , client1Message = ''
        , client2Message = '';

      server.on('connect', () => serverConnections++);
      client1.on('connect', () => client1Connections++);
      client2.on('connect', () => client2Connections++);
      server.on('disconnect', () => serverConnections--);
      client1.on('disconnect', () => client1Connections--);
      client2.on('disconnect', () => client2Connections--);

      let emitToClient1, emitToClient2;
      server.on('connect', (clientSocket) => {
        if (client1.socket.id == clientSocket.id) emitToClient1 = (...args) => clientSocket.emit(...args);
        if (client2.socket.id == clientSocket.id) emitToClient2 = (...args) => clientSocket.emit(...args);
      });

      server.on('message', (msg) => serverMessage = msg);
      client1.on('message', (msg) => client1Message = msg);
      client2.on('message', (msg) => client2Message = msg);

      expect(client1Connections).equal(0);
      expect(client2Connections).equal(0);
      expect(serverConnections).equal(0);

      client1.connect(server);
      expect(client1Connections).equal(1);
      expect(client2Connections).equal(0);
      expect(serverConnections).equal(1);
      emitToClient1('message', 'hi');
      expect(client1Message).equal('hi');
      expect(client2Message).equal('');

      client1.disconnect(server);
      expect(client1Connections).equal(0);
      expect(client2Connections).equal(0);
      expect(serverConnections).equal(0);

      client2.connect(server);
      client1.connect(server);
      expect(client1Connections).equal(1);
      expect(client2Connections).equal(1);
      expect(serverConnections).equal(2);
      emitToClient1('message', 'sup 1');
      expect(client1Message).equal('sup 1');
      expect(client2Message).equal('');
      emitToClient2('message', 'sup 2');
      expect(client1Message).equal('sup 1');
      expect(client2Message).equal('sup 2');

      client2.disconnect(server);
      expect(client1Connections).equal(1);
      expect(client2Connections).equal(0);
      expect(serverConnections).equal(1);
      expect(server.sockets.length).equal(1);

      server.emit('message', 'server hi!');
      expect(serverMessage).equal('');
      expect(client1Message).equal('server hi!');
      expect(client2Message).equal('sup 2');

    });
  });
  describe('Rooms:', function () {
    it('should work with rooms', function () {
      var server = io();
      var chat = ioc();
      var news = ioc();
      var $chat = 0;
      var $news = 0;
      chat.on('connect', () => {
        $chat++;
      });
      news.on('connect', () => {
        $news++;
      });
      chat.connect(server, '/chat');
      news.connect(server, '/news');
      expect($chat, '$chat').equal(1);
      expect($news, '$news').equal(1);
    });

    it('should work with root and rooms', function () {
      var server = io();
      var root = 0;
      var abc = 0;
      var def = 0;
      server.of('/').on('connect', () => root++);
      server.of('/abc').on('connect', () => abc++);
      server.of('def').on('connect', () => def++);
      var c1 = ioc().connect(server, '');
      var c2 = ioc().connect(server, 'abc');
      var c3 = ioc().connect(server, '/def');
      expect(root, 'root').equal(1);
      expect(abc, 'abc').equal(1);
      expect(def, 'def').equal(1);
    });

    it('should connect one time', function () {
      let server = io();
      let client = ioc();
      let simpleConnections = 0
        , clientConnections = 0
        , rootConnections = 0
        , idConnections = 0;
      server.on('connect', () => simpleConnections++);
      client.on('connect', () => clientConnections++);
      server.of('/').on('connect', () => rootConnections++);
      server.of(client.id).on('connect', () => idConnections++);

      client.connect(server, '');

      expect(simpleConnections, 'simpleConnections').equal(1);
      expect(clientConnections, 'clientConnections').equal(1);
      expect(rootConnections, 'rootConnections').equal(1);
      expect(idConnections, 'idConnections').equal(1);
    });

    it('should disconnect one time', function () {
      let server = io();
      let client = ioc();
      let socketDisconnections = 0
        , simpleDisconnections = 0
        , clientDisconnections = 0
        , rootDisconnections = 0
        , idDisconnections = 0;
      server.on('connect', (socket) => {
        socket.on('disconnect', () => socketDisconnections++);
      });
      server.on('disconnect', () => simpleDisconnections++);
      client.on('disconnect', () => clientDisconnections++);
      server.of('/').on('disconnect', () => rootDisconnections++);
      server.of(client.id).on('disconnect', () => idDisconnections++);

      client.connect(server, '');
      client.disconnect();

      expect(socketDisconnections, 'socketDisconnections').equal(1);
      expect(simpleDisconnections, 'simpleDisconnections').equal(1);
      expect(clientDisconnections, 'clientDisconnections').equal(1);
      expect(rootDisconnections, 'rootDisconnections').equal(1);
      expect(idDisconnections, 'idDisconnections').equal(1);
    });
  });
});
