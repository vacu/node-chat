
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path = require('path');

var app = express()
  , server = require('http').createServer(app)
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
    data.username = socket.username;
    socket.broadcast.to(room).emit('sendMsgAdmin', data);
  });

  socket.on('addUser', function(client) {
    client.id = socket.id;
    socket.username = client.username;
    clients[client.username] = client;

    socket.broadcast.to(room).emit('userlist', { data: clients });
  });

  socket.on('disconnect', function() {
    delete clients[socket.username];
    socket.broadcast.to(room).emit('userlist', { data: clients });
  });

  socket.on('private', function(data) {
    data.username = socket.username;
    data.hostId = socket.id;
    io.sockets.sockets[data.id].emit('sendMsgPrivate', data);
  });

  // refresh list every 60 seconds
  setInterval(function() {
    socket.broadcast.to(room).emit('userlist', { data: clients });
  }, 60000);
});
