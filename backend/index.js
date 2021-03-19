const express = require("express");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const players = [
  {
    name: "player1",
    x: 240,
    y: 290,
    isOnline: false,
    socketId: null,
    direction: "east",
  },
  {
    name: "player2",
    x: 200,
    y: 200,
    isOnline: false,
    socketId: null,
    direction: "southEast",
  },
  {
    name: "player3",
    x: 350,
    y: 500,
    isOnline: false,
    socketId: null,
    direction: "south",
  },
  {
    name: "player4",
    x: 100,
    y: 400,
    isOnline: false,
    socketId: null,
    direction: "southWest",
  },
  {
    name: "player5",
    x: -100,
    y: 600,
    isOnline: false,
    socketId: null,
    direction: "west",
  },
  {
    name: "player6",
    x: -200,
    y: 200,
    isOnline: false,
    socketId: null,
    direction: "northWest",
  },
];

io.on("connection", (socket) => {
  const availablePlayer = players.find((player) => !player.isOnline);
  if (availablePlayer) {
    availablePlayer.isOnline = true;
    availablePlayer.socketId = socket.id;
    socket.emit("currentPlayers", players, socket.id);

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerMovement", (playerMoving) => {
      const p = players.find((player) => player.name === playerMoving.name);
      p.x = playerMoving.x;
      p.y = playerMoving.y;

      socket.broadcast.emit("playerMoving", playerMoving);
    });

    socket.on("chatMessage", (message) => {
      const p = players.find((player) => player.socketId === socket.id);
      socket.broadcast.emit("playerMessage", message, p.name);
    });

    socket.on("disconnect", () => {
      availablePlayer.isOnline = false;
      availablePlayer.socketId = null;
      io.emit("playerDisconnected", availablePlayer.name);
    });
  } else {
    // there is no available players
  }
});

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
