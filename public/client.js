/*
* Jonathan Schlebach
* 10112924
* Tutorial 6
* */

// shorthand for $(document).ready(...)
$(function() {

	//variable for messages for readability
    var socket = io();
	var messages = $('#messages');

	//Connection
	socket.emit('new user', 'New client has connected');
	socket.on('clientConnected', function(data) {
        $('#identity').html(data.userName);
		messages.append($('<li>').text(data.userName));
	});

	//Chat function, from demo
    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;

    });

    //Displays the messages sent
    socket.on('chat', function(msg){
        messages.append($('<li>').html(msg.timestamp + ' ' + '<span style="color: #' + msg.color + '"' + '>' + msg.name + '</span>' + ': ' + msg.message));
    });

    //Loads message history as passed by the server
    socket.on('loadHistory', function(data) {
        for(i = 0; i < data.length; i++) {
            messages.append($('<li>').text(data[i]));
        }
    });

    //Loads the user list
    socket.on('userListUpdate', function(data) {
        var temp ='';
        for(i = 0; i < data.length; i++) {
            temp = temp + data[i] + "<br/>";
        }
        $('#users').html(temp);
    });

    //updates what is shown for the user info at the top of the chatbox is changed.
    socket.on('nameChange', function(data) {
        $('#identity').html(data.userName);
    });

    //Error function for choosing a duplicate nickname
	socket.on('duplicate', function(msg){
		messages.append($('<li>').text(msg.errorMessage));
	});

});
