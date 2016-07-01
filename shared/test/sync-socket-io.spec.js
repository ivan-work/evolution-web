import io, {SyncSocketServer} from './sync-socket-io';
import ioc, {SyncSocket} from './sync-socket-io-client';

describe('sync-socket-io', function () {
  it('should fire a `connect` event', function () {
    var server = io();
    var client = ioc();
    server.on('connect', function (socket) {
      expect(socket).instanceOf(SyncSocket);
    });
    client.connect(server);
  });

  it('should work with many sockets', function () {
    var server = io();
    var chat = ioc(null, '/chat');
    var news = ioc(null, '/news');
    var $chat = 0;
    var $news = 0;
    chat.on('connect', () => {
      $chat++;
    });
    news.on('connect', () => {
      $news++;
    });
    chat.connect(server);
    news.connect(server);
    expect($chat, '$chat').equal(1);
    expect($news, '$news').equal(1);
  });

  it('should be able to equivalently start with "" or "/" on server', function () {
    var server = io();
    var $root = 0;
    var $news = 0;
    server.of('/').on('connect', function () {
      $root++;
    });
    server.of('/abc').on('connect', function () {
      $news++;
    });
    var c1 = ioc(server, '/');
    var c2 = ioc(server, '/abc');
    expect($root, '$root').equal(1);
    expect($news, '$news').equal(1);
  });

  it('should be equivalent for "" and "/" on client', function () {
    var server = io();
    var connected = false;
    server.of('/').on('connect', function () {
      connected = true;
    });
    var c1 = ioc(server, '');
    expect(connected).true;
  });

  it('should work with `of` and many sockets', function () {
    var server = io();
    var chat = ioc(null, '/chat');
    var news = ioc(null, '/news');
    var total = 2;
    server.of('/chat').on('connect', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    server.of('/news').on('connect', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    expect(total).equal(2);
    chat.connect(server);
    news.connect(server);
    expect(total).equal(0);
  });

  it('SYNC should work with `of` and many sockets', function () {
    var server = io();
    var chat = ioc(null, '/chat');
    var news = ioc();
    var total = 2;
    server.of('/chat').on('connect', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    server.of('/news').on('connect', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    chat.connect(server);
    news.connect(server, '/news');
    expect(total).equal(0);
  });

  it('should work with `of` second param', function () {
    var server = io();
    var chat = ioc();
    var news = ioc();
    var total = 2;
    server.of('/news', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    server.of('/news', function (socket) {
      expect(socket).instanceOf(SyncSocket);
      --total
    });
    chat.connect(server, '/chat');
    news.connect(server, '/news');
    expect(total).equal(0);
  });

  it('should disconnect upon transport disconnect', function () {
    var server = io();
    var chat = ioc();
    var news = ioc();

    chat.connect(server, '/chat');
    news.connect(server, '/news');

    expect(server.of('/chat').clients.length == 1, 'server(chat).clients == 2').true;
    chat.disconnect();
    news.disconnect();
    expect(server.of('chat').clients.length == 0, 'server.of(chat).clients == 0').true;
    expect(server.of('/news').clients.length == 0, 'server.of(news).clients == 0').true;
  });
});
