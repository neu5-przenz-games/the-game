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

const getWalkableGrid = () => {
  const tempGrid = grid.clone();
  players.forEach((pl) => tempGrid.setWalkableAt(pl.tileX, pl.tileY, false));
  return tempGrid;
};

const isTileWalkable = (tileX, tileY) => {
  return (
    tileX >= 0 &&
    tileY >= 0 &&
    map[tileY][tileX] === 0 &&
    getWalkableGrid().isWalkableAt(tileX, tileY)
  );
};

io.on("connection", (socket) => {
  const availablePlayer = players.find((player) => !player.isOnline);
  if (availablePlayer) {
    availablePlayer.isOnline = true;
    availablePlayer.socketId = socket.id;
    socket.emit("currentPlayers", players, socket.id);

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerWishToGo", ({ destX, destY, name, tileX, tileY }) => {
      if (isTileWalkable(tileX, tileY)) {
        const p = players.find((player) => player.name === name);
        if (p.tileX !== tileX || p.tileY !== tileY) {
          p.destTileX = tileX;
          p.destTileY = tileY;
          p.destX = destX;
          p.destY = destY;
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
      } else {
        const path = finder.findPath(
          playerNew.tileX,
          playerNew.tileY,
          playerNew.destTileX,
          playerNew.destTileY,
          getWalkableGrid()
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
        }
      }
      // If destination is reached then clear it
      if (
        playerNew.tileX === playerNew.destTileX &&
        playerNew.tileY === playerNew.destTileY
      ) {
        playerNew.destTileX = null;
        playerNew.destTileY = null;
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
        direction: player.direction,
        destTileX: player.destTileX,
        destTileY: player.destTileY,
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
