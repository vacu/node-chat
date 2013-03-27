
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , path = require('path')
  , passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var GOOGLE_CLIENT_ID      = '726276121095-vsh7f169as2c72co46g6ttnlbpbsk3oj.apps.googleusercontent.com'
  , GOOGLE_CLIENT_SECRET  = 'MgBJa7iGlwOVnl2RAyqBObpl';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://node-chat.com:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));


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
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/chat', chat.index);

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/chat');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/chat');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

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
