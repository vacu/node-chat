exports.index = function(req, res) {
  res.render('chat', { title: 'Chat test', user: req.user })
};
