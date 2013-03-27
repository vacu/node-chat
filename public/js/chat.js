socket.on('userlist', function(data) {
  var html = '';

  $.each(data, function(key, value) {
    $.each(value, function(key, client) {
      html += '<p class="user" id="' + client.username + '">' + client.username + '</p>';
    });
  });

  $('#users').html(html);
});

socket.on('sendMsgAdmin', function(data) {
  $('.chatBox').val($('.chatBox').val() + data.username + ':' + data.message + '\n');
});

$(document).ready(function() {
  $('.privateform').hide();

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
    $('.privateform').show();
  });
});