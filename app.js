
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path = require('path');

var app = express()
  , server = require('http').createServer(app)
  // , admin = require('./routes/admin')
  , chat = require('./routes/chat');

GLOBAL.io = require('socket.io').listen(server);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('vhgMWMkEVkjVExsAcmZ4j3PgTGqUNR'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
// app.get('/admin/:chatId', admin.chat);
app.get('/chat', chat.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var clients = {};

io.sockets.on('connection', function(socket) {
  var sh = socket.handshake
    , room = 'test';

  socket.join(room);

  socket.on('send', function(data) {
    socket.broadcast.to(room).emit('sendMsgAdmin', data);
  });

  socket.on('addUser', function(client) {
    socket.username = client.username;
    clients[client.username] = client;

    socket.broadcast.to(room).emit('userlist', { data: clients });
    // console.log('connect = ' + socket.manager.roomClients)
    // client.on('disconnect', function() {
      // clients.splice(clients.indexOf(client), 1);
      // socket.broadcast.to(room).emit('userlist', { data: clients });
    //   socket.broadcast.to(room).emit('userlist', socket.manager.roomClients);
    //   console.log('disconnect = ' + socket.manager.roomClients)
    // });
  });

  socket.on('disconnect', function() {
    // for (var client in clients) {
    //   var currClient = clients[client];

    //   if (currClient.username == socket.username) {
    //     clients.splice(client, 1);
    //   }
    // }
    delete clients[socket.username];
    socket.broadcast.to(room).emit('userlist', { data: clients });
  });
});
