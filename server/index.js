const express = require("express");
const { SnapshotInterpolation } = require("@geckos.io/snapshot-interpolation");
const PF = require("pathfinding");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const map = require("../public/assets/map/map.js");
const gameObjects = require("../public/assets/map/gameObjects.js");
const { directions, getDirection } = require("./utils/directions");
const { getRespawnTile, getXYFromTile } = require("./utils/algo");

const { Player } = require("./Player");

const playersConfig = require("./mocks/players");

const FRAME_IN_MS = 1000 / 30;

const players = new Map();
playersConfig.forEach((player) => {
  players.set(player.name, new Player(player));
});

const SI = new SnapshotInterpolation();

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

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

        if (player.isDead) {
          return;
        }

        if (
          player.positionTile.tileX !== tileX ||
          player.positionTile.tileY !== tileY
        ) {
          if (player.selectedPlayer) {
            player.selectedPlayer = null;
            player.selectedPlayerTile = null;
          }

          player.dest = {
            ...getXYFromTile(tileX, tileY),
            tile: { tileX, tileY },
          };
        }
      }
    });

    socket.on("selectPlayer", ({ name, selectedObjectName, type }) => {
      const player = players.get(name);

      if (player.isDead) {
        return;
      }

      if (type === "Skeleton") {
        const selectedPlayer = players.get(selectedObjectName);

        player.setSelectedObject(selectedPlayer);
      } else {
        const selectedObject = gameObjects.find(
          (obj) => obj.name === selectedObjectName
        );

        player.setSelectedObject(selectedObject);
      }

      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }
    });

    socket.on("settings:follow", ({ name, value }) => {
      const player = players.get(name);

      if (player) {
        player.setSettingsFollow(value);
      }
    });

    socket.on("settings:fight", ({ name, value }) => {
      const player = players.get(name);

      if (player) {
        player.setSettingsFight(value);
      }
    });

    socket.on("settings:showRange", ({ name, value }) => {
      const player = players.get(name);

      if (player) {
        player.setSettingsShowRange(value);
      }
    });

    socket.on("dropSelection", ({ name }) => {
      const player = players.get(name);

      if (player) {
        player.resetSelected();
      }
    });

    socket.on("respawnPlayer", ({ name }) => {
      const player = players.get(name);

      if (player) {
        player.toRespawn = true;
      }
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

let tick = 0;

const loop = () => {
  players.forEach((player) => {
    // Destination is set
    if (player.dest !== null) {
      // Next tile is set
      if (player.next !== null) {
        player.x += directions[player.direction].x * player.speed;
        player.y += directions[player.direction].y * player.speed;

        if (player.x === player.next.x && player.y === player.next.y) {
          player.next = null;
        }

        // player has reached its destination
        if (player.x === player.dest.x && player.y === player.dest.y) {
          player.dest = null;
          player.isWalking = false;
        }
      } else {
        if (player.dropSelection) {
          player.dropSelection = false;
          player.dest = null;
          player.selectedPlayer = null;
          player.selectedPlayerTile = null;

          return;
        }

        const tempGrid = grid.clone();

        // add current players positions to the map grid
        players.forEach((pl) =>
          tempGrid.setWalkableAt(
            pl.positionTile.tileX,
            pl.positionTile.tileY,
            false
          )
        );

        if (player.followedPlayer) {
          player.updateFollowing(map, players);
        }

        const path = finder.findPath(
          player.positionTile.tileX,
          player.positionTile.tileY,
          player.dest.tile.tileX,
          player.dest.tile.tileY,
          tempGrid
        );

        if (path[1]) {
          const [x, y] = path[1];

          player.direction = getDirection(player.positionTile, {
            tileX: x,
            tileY: y,
          });

          if (
            player.selectedPlayer === null ||
            (player.selectedPlayer && player.settings.follow)
          ) {
            player.next = {
              x: player.x + directions[player.direction].nextX,
              y: player.y + directions[player.direction].nextY,
              tile: { tileX: x, tileY: y },
            };
            player.positionTile = player.next.tile;

            player.isWalking = true;
            player.x += directions[player.direction].x * player.speed;
            player.y += directions[player.direction].y * player.speed;
          }
        } else {
          // player can't go there
          player.dest = null;
        }
      }
    }

    if (player.selectedPlayer) {
      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      if (player.settings.fight && player.canAttack({ PF, finder, map })) {
        player.attackDelayTicks = 0;
        player.energyUse("attack");
        player.attack = player.selectedPlayer.name;

        const hit = player.equipment.weapon === "sword" ? 20 : 15;

        player.selectedPlayer.gotHit(hit);

        io.emit("player:hit", {
          name: player.selectedPlayer.name,
          value: hit,
        });

        if (player.selectedPlayer.isDead) {
          io.to(player.selectedPlayer.socketId).emit(
            "player:dead",
            player.selectedPlayer.name
          );
        }
        io.to(player.socketId).emit("player:energy", player.energy);
      }
    }

    if (player.toRespawn) {
      const respawnTile = getRespawnTile({
        map,
        obj: gameObjects.find(
          (b) => b.name === player.settings.respawnBuilding
        ),
        players,
        sizeToIncrease: 3,
      });

      if (respawnTile) {
        player.respawn(respawnTile);
        io.to(player.socketId).emit("player:energy", player.energy);
      } else {
        // fallback for no place to respawn
      }
    }

    if (player.energyRegenerate()) {
      io.to(player.socketId).emit("player:energy", player.energy);
    }

    if (player.attackDelayTicks < player.attackDelayMaxTicks) {
      player.attackDelayTicks += 1;
    }
    if (player.energyRegenDelayTicks < player.energyRegenDelayMaxTicks) {
      player.energyRegenDelayTicks += 1;
    }
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        name: player.name,
        selectedPlayer: player.selectedPlayer && player.selectedPlayer.name,
        weapon: player.equipment.weapon,
        isWalking: player.isWalking,
        isDead: player.isDead,
        attack: player.attack,
        x: player.x,
        y: player.y,
        hp: player.hp,
        destTile: player.dest && player.dest.tile,
        direction: player.direction,
      });
      player.attack = null;
    });

    const snapshot = SI.snapshot.create(worldState);
    SI.vault.add(snapshot);
    io.emit("playersUpdate", snapshot);
  }

  tick += 1;
};

setInterval(loop, FRAME_IN_MS);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
