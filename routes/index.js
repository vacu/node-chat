
/*
 * GET home page.
 */

exports.index = function(req, res) {
  var rooms = [];

  for (var room in io.sockets.manager.rooms) {
    if (room !== '')
      rooms.push(room);
  }

  res.render('index', { title: 'Express', rooms: rooms });
};
