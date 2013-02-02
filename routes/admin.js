
/*
 * GET admin page.
 */

exports.chat = function(req, res) {
  res.render('admin', { title: 'express', room: req.params.chatId })
};
