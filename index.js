var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

var roomList = [];
var clientList = {};

function makeid()
{
  var text = "";
  var possible = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// Serve up content from public directory
app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

io.on('connection', function(socket, opts){

  socket.on('add user', function(data){

    console.log('user %s attempting to join room %s',data.user,data.room);
    if(roomList.indexOf(data.room) != -1)
    {
      socket.join(data.room);
      clientList[data.user] = {socket: socket.id, name: data.user, avatar: data.avatar, score: 0};
      console.log("User "+data.user+" joined room "+data.room);
      io.to(data.room).emit('userjoined', {name: data.user, avatar: data.avatar} );
    }
    else
    {
      socket.emit('badRoom');
      console.log("User "+data.user+" failed to join room");
    }
  });

  socket.on('sendImg', function(data){
    io.to(data.room).emit('usrImg',{user: data.user, image: data.image})
  });

  socket.on('create_game', function(){
    roomID = makeid();

    while(roomList.indexOf(roomID) != -1)
    {
      roomID = makeid();
    }

    roomList.push(roomID)
    socket.join(roomID);
    console.log("Created game "+roomID);
    io.to(roomID).emit('created', roomID)
  });
});

console.log('listening on *:3000');