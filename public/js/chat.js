socket.on('userlist', function(data) {
  var html = '';

  $.each(data, function(key, value) {
    $.each(value, function(key, client) {
      html += '<p class="user" id="' + client.id + '">' + client.username + '</p>';
    });
  });

  $('#users').html(html);
});

socket.on('sendMsgAdmin', function(data) {
  $('.chatBox').val($('.chatBox').val() + data.username + ':' + data.message + '\n');
});

$(document).ready(function() {
  $('.setUser').on('click', function(e) {
    e.preventDefault();

    var username = $('.username').val();
    socket.emit('addUser', { username: username });

    $('.adduserform').hide();
    $('.username').attr('readonly', 'readonly');
  });

  $('.sendBtn').on('click', function(e) {
    e.preventDefault();
    var message   = $('.messageBox').val()
      , chatBox   = $('.chatBox')
      , username  = $('.username').val();

    chatBox.val(chatBox.val() + username + ':' + message + '\n');
    socket.emit('send', { message: message });
  });

  $(document).on('click', '.user', function(e) {
    var self = $(this)
      , chatHtml = '';

    chatHtml += '<div id="' + self.attr('id') + '">';
    chatHtml += '<button class="closeBtn">close</button>';
    chatHtml += '<form><textarea class="privateChatTbox"></textarea><input class="privateChatText" type="text" />';
    chatHtml += '<button id="' + self.attr('id') + '" class="privateChatSend">Send</button></form>';
    chatHtml += '</div>';

    $('#privateChatsWrapper').append(chatHtml);
  });

  $(document).on('click', '.closeBtn', function(e) {
    e.preventDefault();
    $(this).parent().remove();
  });

  $(document).on('click', '.privateChatSend', function(e) {
    e.preventDefault();

    var self      = $(this)
      , message   = self.parent().find('.privateChatText').val()
      , chatTBox  = self.parent().find('.privateChatTbox');

    chatTBox.val(chatTBox.val() + $('.username').val() + ':' + message + '\n');
    socket.emit('private', { message: message, id: self.attr('id') });
  });

  socket.on('sendMsgPrivate', function(data) {
    var chatTBox = $('div#' + data.hostId).find('.privateChatTbox');

    chatTBox.val(chatTBox.val() + data.username + ':' + data.message + '\n');
  });
});