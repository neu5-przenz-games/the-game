const express = require("express");
const PF = require("pathfinding");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js"); // eslint-disable-line
let players = require("./players");

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

setInterval(() => {
  players = players.map((player) => {
    const p = player;

    if (p.isMoving) {
      const [x, y] = finder.findPath(
        p.x,
        p.y,
        p.destX,
        p.destY,
        grid.clone()
      )[1];

      if (players.find((pl) => pl.x === x && pl.y === y)) {
        p.isMoving = false;
        p.destX = null;
        p.destY = null;
      } else {
        p.x = x;
        p.y = y;

        if (p.x === p.destX && p.y === p.destY) {
          p.isMoving = false;
          p.destX = null;
          p.destY = null;
        }
      }
    }

    return p;
  });

  io.emit("playerMoving", players);
}, 250);

io.on("connection", (socket) => {
  const availablePlayer = players.find((player) => !player.isOnline);
  if (availablePlayer) {
    availablePlayer.isOnline = true;
    availablePlayer.socketId = socket.id;
    socket.emit("currentPlayers", players, socket.id);

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerWishToGo", ({ name, x, y }) => {
      if (x >= 0 && y >= 0) {
        if (map[y][x] === 0) {
          const p = players.find((player) => player.name === name);

          if (p.x !== x || p.y !== y) {
            p.isMoving = true;
            p.destX = x;
            p.destY = y;
          }
        }
      }
    });

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
