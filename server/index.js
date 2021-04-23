const express = require("express");
const { SnapshotInterpolation } = require("@geckos.io/snapshot-interpolation");
const PF = require("pathfinding");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js"); // eslint-disable-line
const { directions, getDirection } = require("./utils/directions");
const { getXYFromTile } = require("./utils/algo");

const { Player } = require("./Player");

const playersConfig = require("./players");

const players = new Map();
playersConfig.forEach((player) => {
  players.set(player.name, new Player(player));
});

const SI = new SnapshotInterpolation();
let tick = 0;

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

const events = new Map();

io.on("connection", (socket) => {
  // this is temporarily, will be changed
  let availablePlayer = null;
  players.forEach((player) => {
    if (availablePlayer === null && player.isOnline === false) {
      availablePlayer = player;
    }
  });

  if (availablePlayer) {
    availablePlayer.setOnline(socket.id);

    socket.emit(
      "currentPlayers",
      Array.from(players, ([name, value]) => ({ name, ...value })),
      socket.id
    );

    socket.broadcast.emit("newPlayer", availablePlayer);

    socket.on("playerWishToGo", ({ name, tileX, tileY }) => {
      if (tileX >= 0 && tileY >= 0 && map[tileY][tileX] === 0) {
        const player = players.get(name);

        if (
          player.positionTile.tileX !== tileX ||
          player.positionTile.tileY !== tileY
        ) {
          player.destTile = { tileX, tileY };
          player.dest = getXYFromTile(tileX, tileY);

          if (player.isFollowing) {
            player.resetFollowing();
          }

          events.delete(player.name);
          events.set(player.name, player);
        }
      }
    });

    socket.on("followPlayer", ({ name, nameToFollow }) => {
      const player = players.get(name);
      const playerToFollow = players.get(nameToFollow);

      player.setFollowing(playerToFollow, map);

      events.delete(player.name);
      events.set(player.name, player);
    });

    socket.on("chatMessage", ({ name, text }) => {
      socket.broadcast.emit("playerMessage", text, name);
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

  events.forEach((player) => {
    // Destination is set
    if (player.destTile !== null) {
      // Next tile is set
      if (player.nextTile !== null) {
        player.x += directions[player.direction].x * player.speed;
        player.y += directions[player.direction].y * player.speed;

        if (player.x === player.next.x && player.y === player.next.y) {
          player.nextTile = null;
        }

        // player has reached its destination
        if (player.x === player.dest.x && player.y === player.dest.y) {
          player.destTile = null;
          player.dest = null;

          if (player.isFollowing === false) {
            events.delete(player.name);
          }
        }
      } else {
        const tempGrid = grid.clone();

        // add current players positions to the map grid
        players.forEach((pl) =>
          tempGrid.setWalkableAt(
            pl.positionTile.tileX,
            pl.positionTile.tileY,
            false
          )
        );

        if (player.isFollowing) {
          player.updateFollowing(map);
        }

        const path = finder.findPath(
          player.positionTile.tileX,
          player.positionTile.tileY,
          player.destTile.tileX,
          player.destTile.tileY,
          tempGrid
        );

        if (path[1]) {
          const [x, y] = path[1];

          player.direction = getDirection(player.positionTile, {
            tileX: x,
            tileY: y,
          });

          player.nextTile = { tileX: x, tileY: y };
          player.positionTile = player.nextTile;
          player.next = {
            x: player.x + directions[player.direction].nextX,
            y: player.y + directions[player.direction].nextY,
          };

          player.x += directions[player.direction].x * player.speed;
          player.y += directions[player.direction].y * player.speed;
        } else {
          // player can't go there
          player.destTile = null;
        }
      }
    } else if (player.isFollowing) {
      player.updateFollowing(map);
    }
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        name: player.name,
        x: player.x,
        y: player.y,
        destTile: player.destTile,
        direction: player.direction,
      });
    });

    const snapshot = SI.snapshot.create(worldState);
    SI.vault.add(snapshot);
    io.emit("playersUpdate", snapshot);
  }
};

setInterval(loop, 1000 / 30);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
