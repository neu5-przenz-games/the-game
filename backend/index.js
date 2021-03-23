const express = require("express");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js");
let players = require("./players");

let timePast = Date.now();

const canGo = ({ x, y }) => {
  const tile = map[y][x];

  // TODO (#50): add check if there is no other player at the moment

  return tile === -1;
};

io.on("connection", (socket) => {
  const availablePlayer = players.find((player) => !player.isOnline);
  if (availablePlayer) {
    availablePlayer.isOnline = true;
    availablePlayer.socketId = socket.id;
    socket.emit("currentPlayers", players, socket.id);

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerWishToGo", ({ name, x, y }) => {
      if (x > 0 && y > 0) {
        if (canGo({ x, y, map })) {
          const p = players.find((player) => player.name === name);

          p.isMoving = true;
          p.destX = x;
          p.destY = y;
        }
      }
    });

    setInterval(() => {
      players = players.map((player) => {
        const p = player;
        const timeNow = Date.now();

        if (player.isMoving && timeNow - timePast >= 200) {
          timePast = timeNow;

          if (player.x > player.destX) {
            p.x -= 1;
          } else if (player.x < player.destX) {
            p.x += 1;
          } else if (player.y > player.destY) {
            p.y -= 1;
          } else if (player.y < player.destY) {
            p.y += 1;
          } else {
            p.isMoving = false;
            p.destX = null;
            p.destY = null;
          }
        }

        return p;
      });

      socket.emit("playerMoving", players);
    }, 50);

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
