/*
Jonathan Schlebach
10112924
Tutorial 6*/

//Node libraries
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

//server listen function
http.listen( port, function () {
    console.log('listening on port', port);
});
app.use(express.static(__dirname + '/public'));

//Arrays for storing the user list and the messaging history, and the user count for making new names on each login
var messageHistory = [];
var userList = [];

var userCount = 1;

io.on('connection', function(socket){

    //New user connecting, update what ther display name is and give them the message history
	socket.on('new user', function(data){
		var tempName = "User " + userCount;
		userCount++;

        socket.nickname = tempName;
        userList.push(tempName);

        socket.emit('loadHistory', messageHistory);
		socket.emit('clientConnected',{userName: 'You are ' + tempName});
		io.sockets.emit('userListUpdate', userList);
	});

	//Chat recieved
	socket.on('chat', function(msg){
		//dates for thje timestamp
		var time = new Date();

		//check if they are trying to change the color of their name
        //Have to start with /nickcolor or else /nick catches and screws up the color
		if (msg.startsWith('/nickcolor')) {
			socket.color = msg.slice(11);
		}
		//Check if they are changing their user name
		else if (msg.startsWith('/nick')) {
				//make sure the new nickname the user wants isnt already in the array, or give an error
				if(userList.indexOf(msg.slice(6)) != -1) {
					socket.emit('duplicate', {errorMessage: 'That username already exists!'});
				}
				//Not taken yet, change the nickname
				else {
					var temp = userList.indexOf(socket.nickname);
					socket.nickname = msg.slice(6);
					userList[temp] = socket.nickname;

                    io.sockets.emit('userListUpdate', userList);
					socket.emit('nameChange', {userName: 'You are ' + socket.nickname});
				}
		}
		//if not, post the chat
		else {

			var timeStamp = time.getHours() + ':' + time.getMinutes()
            var chatMessage = timeStamp + ' ' + socket.nickname + ': ' + msg;
			chatMessage = chatMessage.toString();
			messageHistory.push(chatMessage);
			io.sockets.emit('chat', {name: socket.nickname,  message: msg, timestamp: timeStamp, color: socket.color  });
		}
	});	

	//Remove username from the userlist on a disconnect
    socket.on('disconnect', function (){
		userList.splice(userList.indexOf(socket.nickname), 1);
		io.sockets.emit('userListUpdate', userList);
    });
});
