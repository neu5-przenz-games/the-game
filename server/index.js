const express = require("express");
const { SnapshotInterpolation } = require("@geckos.io/snapshot-interpolation");
const PF = require("pathfinding");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js"); // eslint-disable-line
const { directions, getDirection } = require("./directions");
let players = require("./players");

const SI = new SnapshotInterpolation();
let tick = 0;

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

io.on("connection", (socket) => {
  const availablePlayer = players.find((player) => !player.isOnline);
  if (availablePlayer) {
    availablePlayer.isOnline = true;
    availablePlayer.socketId = socket.id;
    socket.emit("currentPlayers", players, socket.id);

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerWishToGo", ({ destX, destY, name, tileX, tileY }) => {
      if (tileX >= 0 && tileY >= 0) {
        if (map[tileY][tileX] === 0) {
          const p = players.find((player) => player.name === name);
          if (p.tileX !== tileX || p.tileY !== tileY) {
            p.destTileX = tileX;
            p.destTileY = tileY;
            p.destX = destX;
            p.destY = destY;
          }
        }
      }
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
    // No available player slots
    socket.disconnect();
  }
});

const loop = () => {
  tick += 1;

  players = players.map((player) => {
    const playerNew = player;

    // Destination is set
    if (playerNew.destTileX !== null && playerNew.destTileY !== null) {
      // Next tile is set
      if (playerNew.nextTileX !== null && playerNew.nextTileY !== null) {
        playerNew.x += directions[playerNew.direction].x * playerNew.speed;
        playerNew.y += directions[playerNew.direction].y * playerNew.speed;

        if (
          playerNew.x === playerNew.nextX &&
          playerNew.y === playerNew.nextY
        ) {
          playerNew.tileX = playerNew.nextTileX;
          playerNew.tileY = playerNew.nextTileY;
          playerNew.nextTileX = null;
          playerNew.nextTileY = null;
        }

        if (
          playerNew.x === playerNew.destX &&
          playerNew.y === playerNew.destY
        ) {
          playerNew.destTileX = null;
          playerNew.destTileY = null;
          playerNew.destX = null;
          playerNew.destY = null;
        }
      } else {
        const tempGrid = grid.clone();

        // add current players positions to the map grid
        players.forEach((pl) =>
          tempGrid.setWalkableAt(pl.tileX, pl.tileY, false)
        );

        const path = finder.findPath(
          playerNew.tileX,
          playerNew.tileY,
          playerNew.destTileX,
          playerNew.destTileY,
          tempGrid
        );

        if (path[1]) {
          const [x, y] = path[1];

          playerNew.direction = getDirection(
            { x: playerNew.tileX, y: playerNew.tileY },
            { x, y }
          );
          playerNew.nextTileX = x;
          playerNew.nextTileY = y;
          playerNew.nextX = playerNew.x + directions[playerNew.direction].nextX;
          playerNew.nextY = playerNew.y + directions[playerNew.direction].nextY;

          playerNew.x += directions[playerNew.direction].x * playerNew.speed;
          playerNew.y += directions[playerNew.direction].y * playerNew.speed;
        } else {
          // player can't go there
          playerNew.destTileX = null;
          playerNew.destTileY = null;
        }
      }
    }

    return playerNew;
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        x: parseFloat(player.x.toFixed(2)),
        y: parseFloat(player.y.toFixed(2)),
        destTileX: player.destTileX,
        destTileY: player.destTileY,
        direction: player.direction,
      });
    });

    const snapshot = SI.snapshot.create(worldState);
    SI.vault.add(snapshot);
    io.emit("playerMoving", snapshot);
  }
};

setInterval(loop, 1000 / 30);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
