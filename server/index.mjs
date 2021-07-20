import express from "express";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import PF from "pathfinding";

import { createServer } from "http";
import { Server } from "socket.io";

import map from "../public/assets/map/map.mjs";
import {
  ITEM_ACTIONS,
  gameObjects,
  getAction,
  getCurrentWeapon,
  getDuration,
  getItem,
} from "../shared/index.mjs";
import { directions, getDirection } from "./utils/directions.mjs";
import { getRespawnTile, getXYFromTile } from "./utils/algo.mjs";
import getHitType from "./utils/hitText.mjs";

import Player from "./gameObjects/Player.mjs";

import playersConfig from "./mocks/players.mjs";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

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
      "players:list",
      Array.from(players, ([name, value]) => ({ name, ...value })),
      socket.id
    );

    socket.broadcast.emit("player:new", availablePlayer);

    socket.on("player:go", ({ name, tileX, tileY }) => {
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

          if (player.resetActionDuration()) {
            io.to(player.socketId).emit("action:end");
          }

          player.dest = {
            ...getXYFromTile(tileX, tileY),
            tile: { tileX, tileY },
          };
        }
      }
    });

    socket.on("player:selection:add", ({ name, selectedObjectName, type }) => {
      const player = players.get(name);

      if (player.isDead) {
        return;
      }

      if (player.resetActionDuration()) {
        io.to(player.socketId).emit("action:end");
      }

      player.action = null;
      player.isWalking = false;

      if (type === "Skeleton") {
        const selectedPlayer = players.get(selectedObjectName);

        player.setSelectedObject(selectedPlayer);
      } else {
        const selectedObject = gameObjects.find(
          (obj) => obj.name === selectedObjectName
        );

        player.setSelectedObject(selectedObject);

        const action = getAction(selectedObject);
        if (action) {
          player.action = action;
        }
      }

      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      io.to(player.socketId).emit("action:button:set", {
        name: player.action,
      });
    });

    socket.on("settings:follow", ({ name, value }) => {
      const player = players.get(name);

      if (player) {
        player.isWalking = false;
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

    socket.on("player:selection:drop", ({ name }) => {
      const player = players.get(name);

      if (player) {
        player.resetSelected();
      }
    });

    socket.on("player:respawn", ({ name }) => {
      const player = players.get(name);

      if (player) {
        player.toRespawn = true;
      }
    });

    if (process.env.NODE_ENV === "development") {
      socket.on("game:killPlayer", ({ name }) => {
        const player = players.get(name);

        if (player) {
          player.toKill = true;
        }
      });
    }

    socket.on("action:button:clicked", ({ name }) => {
      const player = players.get(name);

      if (!player.canPerformAction()) {
        // @TODO: send message that action can't be performed #164
        return;
      }

      const durationTicks = getDuration(player.selectedPlayer);

      player.actionDurationTicks = 0;
      player.actionDurationMaxTicks = durationTicks;

      player.energyUse(player.action);
      io.to(player.socketId).emit(
        "action:start",
        Math.ceil(durationTicks * FRAME_IN_MS)
      );
    });

    socket.on(
      "action:item",
      ({ name, actionName, itemName, equipmentItemType }) => {
        const player = players.get(name);

        if (!player) {
          return;
        }

        ({
          [ITEM_ACTIONS.DESTROY]: () => {
            if (player.destroyItem(itemName, equipmentItemType)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          },
          [ITEM_ACTIONS.MOVE_TO_BACKPACK]: () => {
            if (player.moveToBackpack(itemName, equipmentItemType)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          },
          [ITEM_ACTIONS.MOVE_TO_EQUIPMENT]: () => {
            if (player.moveToEquipmentFromBackpack(itemName)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          },
        }[actionName]());
      }
    );

    socket.on("player:message:send", ({ name, text }) => {
      socket.broadcast.emit("chat:message:add", text, name);
    });

    socket.on("disconnect", () => {
      availablePlayer.isOnline = false;
      availablePlayer.socketId = null;
      io.emit("player:disconnected", availablePlayer.name);
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

    if (player.dropSelection) {
      player.dropSelection = false;
      player.selectedPlayer = null;
      player.selectedPlayerTile = null;
    }

    if (player.selectedPlayer) {
      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      if (player.settings.fight && player.canAttack({ PF, finder, map })) {
        player.attackDelayTicks = 0;
        player.energyUse("attack");
        player.attack = player.selectedPlayer.name;

        const hit = getCurrentWeapon(player.equipment.weapon).weapon.attack;

        player.selectedPlayer.gotHit(hit);

        if (player.hasRangedWeapon() && player.useArrow()) {
          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }

        io.emit("player:hit", {
          name: player.selectedPlayer.name,
          hitType: getHitType(hit),
        });

        if (player.selectedPlayer.isDead) {
          io.to(player.selectedPlayer.socketId).emit(
            "player:dead",
            player.selectedPlayer.name
          );
        }
        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
    }

    if (player.toRespawn) {
      const respawnTile = getRespawnTile({
        map,
        obj: gameObjects.find(
          (b) => b.name === player.settings.respawnBuilding.name
        ),
        players,
        sizeToIncrease: 3,
      });

      if (respawnTile) {
        player.respawn(respawnTile);
        io.to(player.socketId).emit("player:energy:update", player.energy);
      } else {
        // fallback for no place to respawn
      }
    }

    if (player.energyRegenerate()) {
      io.to(player.socketId).emit("player:energy:update", player.energy);
    }

    if (player.attackDelayTicks < player.attackDelayMaxTicks) {
      player.attackDelayTicks += 1;
    }
    if (player.energyRegenDelayTicks < player.energyRegenDelayMaxTicks) {
      player.energyRegenDelayTicks += 1;
    }
    if (
      Number.isInteger(player.actionDurationTicks) &&
      player.actionDurationTicks < player.actionDurationMaxTicks
    ) {
      player.actionDurationTicks += 1;
    } else if (player.resetActionDuration()) {
      io.to(player.socketId).emit("action:end");

      const item = getItem(player.selectedPlayer);
      if (item && player.addToBackpack([item])) {
        io.to(player.socketId).emit("items:update", player.backpack);
      }
    }

    if (process.env.NODE_ENV === "development") {
      if (player.toKill) {
        player.toKill = false;
        player.gotHit(100);
        io.to(player.socketId).emit("player:dead", player.name);
      }
    }
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        equipment: player.equipment,
        selectedPlayer: player.selectedPlayer && player.selectedPlayer.name,
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
    io.emit("players:update", snapshot);
  }

  tick += 1;
};

setInterval(loop, FRAME_IN_MS);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

export default httpServer.listen(process.env.PORT || 5000);
