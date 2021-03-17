const express = require("express");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const players = [
  {
    id: "player1",
    x: 240,
    y: 290,
    walkingAnimationMapping: 0,
    isOnline: false,
    socketId: null,
    direction: "east",
  },
  {
    id: "player2",
    x: 200,
    y: 200,
    walkingAnimationMapping: 1,
    isOnline: false,
    socketId: null,
    direction: "southEast",
  },
  {
    id: "player3",
    x: 350,
    y: 500,
    walkingAnimationMapping: 2,
    isOnline: false,
    socketId: null,
    direction: "south",
  },
  {
    id: "player4",
    x: 100,
    y: 400,
    walkingAnimationMapping: 3,
    isOnline: false,
    socketId: null,
    direction: "southWest",
  },
  {
    id: "player5",
    x: -100,
    y: 600,
    walkingAnimationMapping: 4,
    isOnline: false,
    socketId: null,
    direction: "west",
  },
  {
    id: "player6",
    x: -200,
    y: 200,
    walkingAnimationMapping: 5,
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
      const p = players.find((player) => player.id === playerMoving.id);
      p.x = playerMoving.x;
      p.y = playerMoving.y;
      p.facingDirection = playerMoving.facingDirection;

      socket.broadcast.emit("playerMoving", playerMoving);
    });

    socket.on("disconnect", () => {
      availablePlayer.isOnline = false;
      availablePlayer.socketId = null;
      io.emit("playerDisconnected", availablePlayer.id);
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
