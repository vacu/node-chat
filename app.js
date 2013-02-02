
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path = require('path');

var app = express()
  , server = require('http').createServer(app)
  , admin = require('./routes/admin')
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
app.get('/admin/:chatId', admin.chat);
app.get('/chat', chat.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  var sh = socket.handshake
    , room = '';

  if (sh.headers.referer.split('/')[4] == undefined) {
    room = sh.query.t;
  }
  else
    room = sh.headers.referer.split('/')[4];

  socket.join(room);

  socket.on('adminSend', function(data) {
    console.log('sent to = ' + room)
    socket.broadcast.to(room).emit('getmessage', data);
  });

  socket.on('send', function(data) {
    console.log('sent to = ' + room)
    socket.broadcast.to(room).emit('sendMsgAdmin', data);
  });
});
