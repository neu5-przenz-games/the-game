const express = require("express");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const players = {};

io.on("connection", (socket) => {
  // create a new player and add it to our players object
  players[socket.id] = {
    playerId: socket.id,
  };
  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on("disconnect", () => {
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("playerDisconnected", socket.id);
  });
});

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
