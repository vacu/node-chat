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
  $('#chatForm').hide();

  $('.setUser').on('click', function(e) {
    e.preventDefault();

    var username = $('.username').val();
    socket.emit('addUser', { username: username });

    $('.adduserform').hide();
    $('.username').attr('readonly', 'readonly');
    $('#chatForm').show();
  });

  $('.sendBtn').on('click', function(e) {
    e.preventDefault();
    var message   = $('.messageBox')
      , chatBox   = $('.chatBox')
      , username  = $('.username').val();

    chatBox.val(chatBox.val() + username + ':' + message.val() + '\n');
    socket.emit('send', { message: message.val() });
    message.val('');
  });

  $(document).on('click', '.user', function(e) {
    var self = $(this)
      , chatHtml = '';

    chatHtml += '<div id="' + self.attr('id') + '" class="singleChatWrapper">';
    chatHtml += '<div><button class="closeBtn btn btn-danger">close</button></div>';
    chatHtml += '<div><form><textarea class="privateChatTbox" readonly="readonly"></textarea></div>';
    chatHtml += '<div class="input-append"><input style="width: 475px;" class="privateChatText span2" type="text" />';
    chatHtml += '<button id="' + self.attr('id') + '" class="privateChatSend btn">Send</button></div>';
    chatHtml += '</form></div>';

    $('#privateChatsWrapper').append(chatHtml);
  });

  $(document).on('click', '.closeBtn', function(e) {
    e.preventDefault();
    $(this).parent().parent().remove();
  });

  $(document).on('click', '.privateChatSend', function(e) {
    e.preventDefault();

    var self      = $(this)
      , message   = self.parent().parent().find('.privateChatText')
      , chatTBox  = self.parent().parent().find('.privateChatTbox');

    chatTBox.val(chatTBox.val() + $('.username').val() + ':' + message.val() + '\n');
    socket.emit('private', { message: message.val(), id: self.attr('id') });
    message.val('');
  });

  socket.on('sendMsgPrivate', function(data) {
    var chatTBox = $('div#' + data.hostId).find('.privateChatTbox');

    chatTBox.val(chatTBox.val() + data.username + ':' + data.message + '\n');
  });
});