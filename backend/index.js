const express = require("express");
const { SnapshotInterpolation } = require("@geckos.io/snapshot-interpolation");
const PF = require("pathfinding");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js"); // eslint-disable-line
let players = require("./players");

const SI = new SnapshotInterpolation();
let tick = 0;

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

const getDirection = (currentTile, nextTile) =>
  ({
    "1,0": "southEast",
    "1,1": "south",
    "0,1": "southWest",
    "-1,1": "west",
    "-1,0": "northWest",
    "-1,-1": "north",
    "0,-1": "northEast",
    "1,-1": "east",
  }[[nextTile.x - currentTile.x, nextTile.y - currentTile.y].join()]);

const directions = {
  west: { x: -2, y: 0, opposite: "east", nextX: -64, nextY: 0 },
  northWest: {
    x: -2,
    y: -1,
    opposite: "southEast",
    nextX: -32,
    nextY: -16,
  },
  north: { x: 0, y: -2, opposite: "south", nextX: 0, nextY: -32 },
  northEast: {
    x: 2,
    y: -1,
    opposite: "southWest",
    nextX: 32,
    nextY: -16,
  },
  east: { x: 2, y: 0, opposite: "west", nextX: 64, nextY: 0 },
  southEast: {
    x: 2,
    y: 1,
    opposite: "northWest",
    nextX: 32,
    nextY: 16,
  },
  south: { x: 0, y: 2, opposite: "north", nextX: 0, nextY: 32 },
  southWest: {
    x: -2,
    y: 1,
    opposite: "northEast",
    nextX: -32,
    nextY: 16,
  },
};

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
    // there is no available players
  }
});

const loop = () => {
  tick += 1;

  players = players.map((player) => {
    const playerNew = player;

    if (playerNew.destTileX !== null && playerNew.destTileY !== null) {
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
        }
      }
    }

    return playerNew;
  });

  if (tick % 5 === 0) {
    io.emit("playerMoving", players);
  }
};

setInterval(loop, 1000 / 60);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
