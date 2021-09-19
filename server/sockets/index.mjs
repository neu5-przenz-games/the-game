import { Server } from "socket.io";

import {
  DEBUG_ITEMS_SETS,
  DEBUG_SKILL_POINTS,
} from "../../shared/debugUtils/index.mjs";
import { UI_ITEM_ACTIONS } from "../../shared/UIItemActions/index.mjs";
import { gameItems } from "../../shared/init/gameItems/index.mjs";
import { bag } from "../../shared/init/gameItems/backpack.mjs";
import { receipts } from "../../shared/receipts/index.mjs";
import {
  setSkillPoints,
  shapeSkillsForClient,
  skillsSchema,
} from "../../shared/skills/index.mjs";
import map from "../../public/assets/map/map.mjs";
import { gameObjects } from "../../shared/init/gameObjects.mjs";
import { getAllies, getXYFromTile } from "../utils/algo.mjs";

const sockets = ({ players, httpServer, FRAME_IN_MS }) => {
  const io = new Server(httpServer);

  return io.on("connection", (socket) => {
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
      io.to(availablePlayer.fraction).emit("players:hp:update", {
        players: getAllies(players, availablePlayer.fraction),
      });

      socket.on("player:go", ({ name, tileX, tileY }) => {
        const mapSize = map.length;
        if (
          tileX >= 0 &&
          tileX < mapSize &&
          tileY >= 0 &&
          tileY < mapSize &&
          map[tileY][tileX] === 0
        ) {
          const player = players.get(name);

          if (player.isDead) {
            return;
          }

          if (
            player.positionTile.tileX !== tileX ||
            player.positionTile.tileY !== tileY
          ) {
            if (player.selectedPlayer) {
              if (
                player.settings.keepSelectionOnMovement &&
                player.settings.follow
              ) {
                player.setSettingsFollow(false);
              }

              if (!player.settings.keepSelectionOnMovement) {
                player.selectedPlayer = null;
              }
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

      socket.on(
        "player:selection:add",
        ({ name, selectedObjectName, type }) => {
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
        }
      );

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

      socket.on("settings:keepSelectionOnMovement", ({ name, value }) => {
        const player = players.get(name);

        if (player) {
          player.setSettingsKeepSelectionOnMovement(value);
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
          const { equipment, backpackItems = [] } = DEBUG_ITEMS_SETS[
            itemsSetType
          ];

          if (player && equipment && backpackItems) {
            const backpackToSet = gameItems.get(equipment.backpack.id);
            player.attackDelayTicks = 0;
            player.attackDelayMaxTicks = gameItems.get(
              equipment.weapon.id
            ).details.attackDelayTicks;
            player.setEquipment(equipment);
            player.setBackpack(backpackToSet.slots, backpackItems);

            io.to(player.socketId).emit(
              "items:update",
              player.backpack,
              player.equipment
            );
          }
        });

        socket.on("player:items:move-to-backpack", ({ name, itemID }) => {
          const player = players.get(name);
          const item = gameItems.get(itemID);

          if (player && item) {
            if (player.moveToBackpackFromEquipment(item.id, item.type)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
          }
        });

        socket.on("player:items:destroy-from-backpack", ({ name, itemID }) => {
          const player = players.get(name);
          const item = gameItems.get(itemID);

          if (player && item) {
            if (player.destroyItem(item.id)) {
              io.to(player.socketId).emit(
                "items:update",
                player.backpack,
                player.equipment
              );
            }
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
};

export { sockets };