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

        if (player.isDead) {
          return;
        }

        if (
          player.positionTile.tileX !== tileX ||
          player.positionTile.tileY !== tileY
        ) {
          player.dest = {
            ...getXYFromTile(tileX, tileY),
            tile: { tileX, tileY },
          };

          if (player.selectedPlayer) {
            player.resetSelected();
          }

          events.delete(player.name);
          events.set(player.name, player);
        }
      }
    });

    socket.on("selectPlayer", ({ name, selectedPlayerName }) => {
      const player = players.get(name);

      if (player.isDead) {
        return;
      }

      if (selectedPlayerName) {
        const playerToSelect = players.get(selectedPlayerName);

        player.setSelectedObject(playerToSelect);

        if (player.settings.follow) {
          player.updateFollowing(map);
        }

        events.delete(player.name);
        events.set(player.name, player);
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

    socket.on("equipment:weapon", ({ name, value }) => {
      const player = players.get(name);

      if (player) {
        player.setWeapon(value);
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
        events.set(player.name, player);
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

const loop = () => {
  tick += 1;

  events.forEach((player) => {
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

          if (player.selectedPlayer === null) {
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

        if (player.followedPlayer) {
          player.updateFollowing(map);
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
        player.updateFollowing(map);
      }

      if (player.settings.fight && player.canAttack({ PF, finder, map })) {
        player.attackDelay = 0;
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
      }
    }

    if (player.attackDelay < 100) {
      player.attackDelay += 1;
    }

    if (player.toRespawn) {
      const respawnTile = getRespawnTile(
        map,
        gameObjects.find((b) => b.name === player.settings.respawnBuilding),
        players
      );

      if (respawnTile) {
        player.respawn(respawnTile);
      } else {
        // fallback for no place to respawn
      }

      events.delete(player.name);
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
};

setInterval(loop, 1000 / 30);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

module.exports = server.listen(process.env.PORT || 5000);
