import express from "express";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import PF from "pathfinding";

import { createServer } from "http";
import { Server } from "socket.io";

import {
  DEBUG_ITEMS_SETS,
  DEBUG_SKILL_POINTS,
} from "../shared/debugUtils/index.mjs";
import { UI_ITEM_ACTIONS } from "../shared/UIItemActions/index.mjs";
import {
  gameItems,
  getCurrentWeapon,
} from "../shared/init/gameItems/index.mjs";
import { bag } from "../shared/init/gameItems/backpack.mjs";
import { receipts } from "../shared/receipts/index.mjs";
import {
  setSkillPoints,
  shapeSkillsForClient,
  skillIncrease,
  skillsSchema,
} from "../shared/skills/index.mjs";

import { gameObjects } from "../shared/init/gameObjects.mjs";
import map from "../public/assets/map/map.mjs";
import { directions, getDirection } from "./utils/directions.mjs";
import { getAllies, getRespawnTile, getXYFromTile } from "./utils/algo.mjs";
import { getHitText } from "./utils/hitText.mjs";

import { Player } from "./gameObjects/Player.mjs";

import { playersMocks } from "./mocks/players.mjs";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const FRAME_IN_MS = 1000 / 30;

const players = new Map();
playersMocks.forEach((player) => {
  players.set(player.name, new Player(player));
});

const SI = new SnapshotInterpolation();

const grid = new PF.Grid(map);

const finder = new PF.AStarFinder({
  allowDiagonal: true,
});

const healingStones = gameObjects.reduce((res, go) => {
  if (go.type === "HealingStone") {
    res.push(go);
  }

  return res;
}, []);

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
      Array.from(players, ([name, value]) => {
        const newValue = {
          ...value,
          crafting: Array.from(receipts, ([id, craftingValue]) => ({
            id,
            displayName: craftingValue.displayName,
          })),
          skills:
            availablePlayer.name === name
              ? shapeSkillsForClient(availablePlayer.skills)
              : shapeSkillsForClient(skillsSchema),
        };

        return {
          name,
          ...newValue,
        };
      }),
      socket.id
    );

    socket.broadcast.emit("player:new", availablePlayer);

    socket.join(availablePlayer.fraction);
    io.to(availablePlayer.fraction).emit(
      "players:hp:update",
      getAllies(players, availablePlayer.fraction)
    );

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

          player.receipt = null;

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

        const { action } = selectedObject;

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

      socket.on("player:items:clear", ({ name }) => {
        const player = players.get(name);

        if (player) {
          player.setEquipment();
          player.setBackpack();

          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }
      });

      socket.on("player:items:give-a-bag", ({ name }) => {
        const player = players.get(name);

        if (player) {
          player.setEquipment({
            backpack: { id: bag.id, quantity: 1 },
          });
          player.setBackpack(bag.slots);

          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }
      });

      socket.on("player:items:set", ({ name, itemsSetType }) => {
        const player = players.get(name);
        const itemsSet = DEBUG_ITEMS_SETS[itemsSetType];

        if (player && itemsSet) {
          const backpackToSet = gameItems.get(itemsSet.backpack.id);
          player.setEquipment(itemsSet);
          player.setBackpack(backpackToSet.slots);

          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }
      });

      socket.on("player:skills:set", ({ name, skillType }) => {
        const player = players.get(name);
        const skillPoints = DEBUG_SKILL_POINTS[skillType];

        if (player && skillPoints !== undefined) {
          Object.entries(player.skills).forEach(([skillKey]) => {
            player.skillUpdate(
              setSkillPoints(player.skills, {
                name: skillKey,
                pointsNumber: skillPoints,
              })
            );
          });

          io.to(player.socketId).emit(
            "skills:update",
            shapeSkillsForClient(player.skills)
          );
        }
      });
    }

    socket.on("action:button:clicked", ({ name }) => {
      const player = players.get(name);

      const { durationTicks, energyCost } = player.selectedPlayer;

      const getResourceResult = player.canGetResource(energyCost);
      if (getResourceResult !== true) {
        io.to(player.socketId).emit("action:rejected", getResourceResult);
        return;
      }

      player.actionDurationTicks = 0;
      player.actionDurationMaxTicks = durationTicks;
      player.receipt = null;

      player.energyUse(energyCost);
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
          [UI_ITEM_ACTIONS.DESTROY]: () => {
            if (player.destroyItem(itemName, equipmentItemType)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          },
          [UI_ITEM_ACTIONS.MOVE_TO_BACKPACK]: () => {
            if (
              player.moveToBackpackFromEquipment(itemName, equipmentItemType)
            ) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          },
          [UI_ITEM_ACTIONS.MOVE_TO_EQUIPMENT]: () => {
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

    socket.on("crafting:button:clicked", ({ id, name }) => {
      const player = players.get(name);
      const receipt = receipts.get(id);

      const craftResult = player.canDoCrafting({
        energyCost: receipt.energyCost,
        requiredItems: receipt.requiredItems,
        requiredSkills: receipt.requiredSkills,
      });
      if (craftResult !== true) {
        io.to(player.socketId).emit("crafting:rejected", craftResult);
        return;
      }

      player.actionDurationTicks = 0;
      player.actionDurationMaxTicks = receipt.durationTicks;

      receipt.requiredItems.forEach((requiredItem) =>
        player.removeFromBackpack(requiredItem.id)
      );

      io.to(player.socketId).emit(
        "items:update",
        player.backpack,
        player.equipment
      );

      player.receipt = receipt;

      player.energyUse(receipt.energyCost);
      io.to(player.socketId).emit(
        "action:start",
        Math.ceil(receipt.durationTicks * FRAME_IN_MS)
      );
    });

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
          player.isWalking = false;

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

    const { selectedPlayer } = player;

    if (selectedPlayer) {
      if (player.settings.follow) {
        player.updateFollowing(map, players);
      }

      if (player.dest === null) {
        player.direction = getDirection(
          player.positionTile,
          selectedPlayer.positionTile
        );
      }

      if (player.settings.fight && player.canAttack({ finder, map, PF })) {
        player.attackDelayTicks = 0;
        player.attack = selectedPlayer.name;

        const currentWeapon = getCurrentWeapon(player.equipment.weapon);
        player.energyUse(currentWeapon.details.energyCost);
        const hit = currentWeapon.details.damage;
        const skillDetails = currentWeapon.skillToIncrease;

        player.skillUpdate(skillIncrease(player.skills, skillDetails));

        io.to(player.socketId).emit(
          "skills:update",
          shapeSkillsForClient(player.skills)
        );

        if (selectedPlayer.equipment.shield) {
          const selectedPlayerSkillDetails = getCurrentWeapon(
            selectedPlayer.equipment.shield
          ).skillToIncrease;

          selectedPlayer.skillUpdate(
            skillIncrease(selectedPlayer.skills, selectedPlayerSkillDetails)
          );

          io.to(selectedPlayer.socketId).emit(
            "skills:update",
            shapeSkillsForClient(selectedPlayer.skills)
          );
        }

        selectedPlayer.hit(hit);

        io.emit("player:hit", {
          name: selectedPlayer.name,
          hitType: getHitText(hit),
        });

        io.to(selectedPlayer.fraction).emit(
          "players:hp:update",
          getAllies(players, selectedPlayer.fraction)
        );

        if (player.hasRangedWeapon() && player.useArrow()) {
          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );
        }

        if (selectedPlayer.isDead) {
          selectedPlayer.dest = null;
          selectedPlayer.next = null;
          selectedPlayer.isWalking = false;

          io.to(selectedPlayer.socketId).emit(
            "player:dead",
            selectedPlayer.name
          );
        }
        io.to(player.socketId).emit("player:energy:update", player.energy);
      }
    } else if (player.dropSelection) {
      player.dropSelection = false;
      player.selectedPlayer = null;
      player.selectedPlayerTile = null;
    }

    if (player.toRespawn) {
      const respawnTile = getRespawnTile({
        map,
        obj: gameObjects.find(
          (b) => b.name === player.settings.respawnBuilding.name
        ),
        players,
        sizeToIncrease: {
          x: 2,
          y: 2,
        },
      });

      if (respawnTile) {
        player.respawn(respawnTile);
        io.to(player.socketId).emit("player:energy:update", player.energy);
        io.to(player.fraction).emit(
          "players:hp:update",
          getAllies(players, player.fraction)
        );
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
      // action has ended
      io.to(player.socketId).emit("action:end");

      let item = null;
      let skillDetails = null;

      if (player.receipt) {
        // crafting action
        const { createdItem, skill } = player.receipt;

        item = { ...createdItem };
        skillDetails = { ...skill };
      } else if (player.selectedPlayer) {
        // getting resources action
        item = player.selectedPlayer.item;
        skillDetails = player.selectedPlayer.skill;
      }

      player.receipt = null;
      player.skillUpdate(skillIncrease(player.skills, skillDetails));

      io.to(player.socketId).emit(
        "skills:update",
        shapeSkillsForClient(player.skills)
      );

      if (item && player.addToBackpack([item])) {
        io.to(player.socketId).emit(
          "items:update",
          player.backpack,
          player.equipment
        );
      }
    }

    if (process.env.NODE_ENV === "development") {
      if (player.toKill) {
        player.toKill = false;
        player.hit(100);
        io.to(player.socketId).emit("player:dead", player.name);
      }
    }
  });

  healingStones.forEach((healingStone) => {
    if (healingStone.healingDelayTicks >= healingStone.healingDelayMaxTicks) {
      players.forEach((player) => {
        if (
          !player.isDead &&
          healingStone.isPlayerInHealingArea(player.positionTile)
        ) {
          player.heal(healingStone.HP_REGEN_RATE);

          io.to(player.fraction).emit(
            "players:hp:update",
            getAllies(players, player.fraction)
          );
        }
      });

      healingStone.healingDelayTicks = 0;
    }

    if (healingStone.healingDelayTicks < healingStone.healingDelayMaxTicks) {
      healingStone.healingDelayTicks += 1;
    }
  });

  if (tick % 4 === 0) {
    tick = 0;

    const worldState = [];
    players.forEach((player) => {
      worldState.push({
        id: player.name,
        weapon: player.equipment.weapon || {},
        isWalking: player.isWalking,
        isDead: player.isDead,
        attack: player.attack,
        x: player.x,
        y: player.y,
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

export const server = httpServer.listen(process.env.PORT || 5000);
