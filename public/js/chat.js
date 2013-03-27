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
    var message = $('.messageBox').val();
    $('.chatBox').val($('.chatBox').val() + $('.username').val() + ':' + message + '\n');
    socket.emit('send', { message: message });
  });

  $(document).on('click', '.user', function(e) {
    var chatHtml = '<div id="'+$(this).attr('id')+'"><button class="close">close</button><form><textarea class="someclass"></textarea><input class="someinput" type="text" /><button id="'+$(this).attr('id')+'" class="somebutton">Send</button></form></div>';

    $('#qq').append(chatHtml);
  });

  $(document).on('click', '.close', function(e) {
    e.preventDefault();
    $(this).parent().remove();
  });

  $(document).on('click', '.somebutton', function(e) {
    e.preventDefault();
    var message = $(this).parent().find('.someinput').val();
    $(this).parent().find('.someclass').val($(this).parent().find('.someclass').val() + $('.username').val() + ':' + message + '\n');

    socket.emit('private', { message: message, id: $(this).attr('id') });
  });

  socket.on('sendMsgPrivate', function(data) {
    console.log(data.hostId)
    $('div#' + data.hostId).find('.someclass').val($('div#' + data.hostId).find('.someclass').val() + data.username + ':' + data.message + '\n');
  });
});