//import io from 'socket.io';
//import ioc from 'socket.io-client';
//
//var http = require('http').Server;
//
//// Creates a socket.io client for the given server
//function client(srv, nsp, opts){
//  if ('object' == typeof nsp) {
//    opts = nsp;
//    nsp = null;
//  }
//  var addr = srv.address();
//  if (!addr) addr = srv.listen().address();
//  var url = 'ws://localhost:' + addr.port + (nsp || '');
//  return ioc(url, opts);
//}
//
//describe('socket-io', function () {
//  it('should fire a `connect` event', function(done){
//    var srv = http();
//    var sio = io(srv);
//    srv.listen(function(){
//      var socket = client(srv);
//      sio.on('connect', function(socket){
//        done();
//      });
//    });
//  });
//  it('should checknamespaces', function(done){
//    var srv = http();
//    var sio = io(srv);
//    srv.listen(function(){
//      sio.on('hi', () => {
//        console.log('server hi')
//      });
//      sio.on('connect', () => {
//        console.log('server connected')
//      });
//      sio.of('/chat').on('connect', () => {
//        console.log('server/chat connected')
//      });
//      sio.of('/news').on('connect', () => {
//        console.log('server/news connected')
//      });
//
//      //var client1 = client(srv, '/news');
//      //client1.on('connect', () => {
//      //  console.log('client1 / connected')
//      //});
//      //client1.on('hi', () => {
//      //  console.log('client1 received hi')
//      //});
//      //
//      //var client2 = client(srv);
//      //client2.on('connect', () => {
//      //  console.log('client2 / connected')
//      //});
//      //client2.on('hi', () => {
//      //  console.log('client2 received hi')
//      //});
//      //client1.emit('hi');
//      //console.log(client1.emit);
//      setTimeout(done, 500);
//    });
//  });
//});
