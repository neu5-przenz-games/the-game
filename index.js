const express = require('express'); 
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const players = {};

io.on('connection', socket => {
  // create a new player and add it to our players object
  players[socket.id] = {
    score: 0,
    playerId: socket.id
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('playerDisconnected', socket.id);
  });

  socket.on('playerScore', function (player) {
    let id = player.playerId;
    players[id].score = player.score;
    socket.broadcast.emit('playerScored', players[id]);
  });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
     res.sendFile('index.html', {root: __dirname + '/public/'});
});

server.listen(process.env.PORT || 5000, () => {
     console.log(`Server started on port ${process.env.PORT || 5000}`);
});
