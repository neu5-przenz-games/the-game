import { Server } from "socket.io";
import { Player } from "../gameObjects/creatures/Player.mjs";
import { DEBUG_ITEMS_SETS } from "../../shared/debugUtils/index.mjs";
import { UI_ITEM_ACTIONS } from "../../shared/UIItemActions/index.mjs";
import { gameItems } from "../../shared/init/gameItems/index.mjs";
import { ITEM_TYPES } from "../../shared/gameItems/index.mjs";
import { bag } from "../../shared/init/gameItems/backpack.mjs";
import { receipts } from "../../shared/receipts/index.mjs";
import {
  getNewLootingBagItems,
  removeItemsFromLootingBag,
} from "../../shared/gameObjects/index.mjs";
import { getDurationFromTicksToMS } from "../../shared/utils/index.mjs";
import {
  getSkillPoints,
  setSkillPoints,
  shapeSkillsForClient,
  skillsSchema,
} from "../../shared/skills/index.mjs";
import map from "../../public/assets/map/map.mjs";
import { getAllies, getSelectedObject, getXYFromTile } from "../utils/algo.mjs";

const emitLootingBagList = (gameObjects, io) =>
  io.emit(
    "looting-bag:list",
    gameObjects
      .reduce((res, go) => {
        if (go.type === "LootingBag") {
          res.push(go);
        }

        return res;
      }, [])
      .map(({ name, positionTile, items }) => ({
        id: name,
        positionTile,
        items,
      }))
  );

const sockets = ({ gameObjects, httpServer, players }) => {
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
          const type = value.constructor.TYPE;

          return {
            name,
            ...{
              ...value,
              type,
              skills:
                availablePlayer.name === name
                  ? shapeSkillsForClient(availablePlayer.skills)
                  : shapeSkillsForClient(skillsSchema),
              ...(type === Player.TYPE
                ? {
                    crafting: Array.from(receipts, ([id, craftingValue]) => ({
                      id,
                      displayName: craftingValue.displayName,
                    })),
                  }
                : {}),
            },
          };
        }),
        socket.id
      );

      emitLootingBagList(gameObjects, io);

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
            if (player.selectedObjectName) {
              if (
                player.settings.keepSelectionOnMovement &&
                player.settings.follow
              ) {
                player.setSettingsFollow(false);
              }

              if (!player.settings.keepSelectionOnMovement) {
                player.selectedObjectName = null;
              }
              player.selectedObjectTile = null;
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

          let selectedObject = players.get(selectedObjectName);

          if (selectedObject) {
            if (
              type === Player.TYPE &&
              player.isSameFraction(selectedObject.fraction) &&
              !player.settings.attackAlly
            ) {
              io.to(player.socketId).emit(
                "dialog:confirm-attack-ally:show",
                selectedObject.displayName
              );
            }
          } else {
            selectedObject = gameObjects.find(
              (obj) => obj.name === selectedObjectName
            );

            if (selectedObject) {
              const { action } = selectedObject;

              if (action) {
                player.action = action;
              }
            }
          }

          player.setSelectedObjectName(selectedObject.name);

          if (player.settings.follow) {
            player.updateFollowing(map, players, gameObjects);
          }

          // player selected looting bag and stands next to it
          if (type === "LootingBag" && player.dest === null) {
            const openLootingBagResult = player.canInteractWithLootingBag(
              selectedObject.positionTile
            );

            if (openLootingBagResult === true) {
              io.to(player.socketId).emit(
                "dialog:looting-bag:show",
                selectedObject.items
              );
            } else {
              io.to(player.socketId).emit(
                "action:rejected",
                openLootingBagResult
              );
            }
          }

          io.to(player.socketId).emit("action:button:set", {
            name: player.action,
          });
        }
      );

      socket.on("settings:checkbox:set", ({ checkboxName, name, value }) => {
        const player = players.get(name);

        if (player) {
          player[
            {
              attackAlly: "setSettingsAttackAlly",
              follow: "setSettingsFollow",
              fight: "setSettingsFight",
              showRange: "setSettingsShowRange",
              keepSelectionOnMovement: "setSettingsKeepSelectionOnMovement",
            }[checkboxName]
          ](value);

          if (checkboxName === "attackAlly") {
            io.emit("dialog:close");
          }
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
          const { equipment, backpackItems = [] } =
            DEBUG_ITEMS_SETS[itemsSetType];

          if (player && equipment && backpackItems) {
            const backpackToSet = gameItems.get(equipment.backpack.id);
            player.attackDelayTicks.value = 0;
            player.attackDelayTicks.maxValue = gameItems.get(
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
          const skillPoints = getSkillPoints(skillType);

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

        const selectedObject = getSelectedObject({
          players,
          gameObjects,
          selectedObjectName: player.selectedObjectName,
        });

        const getResourceResult = player.canGetResource(
          selectedObject.energyCost,
          gameObjects
        );
        if (getResourceResult !== true) {
          io.to(player.socketId).emit("action:rejected", getResourceResult);
          return;
        }

        player.actionDurationTicks = {
          value: 0,
          maxValue: selectedObject.durationTicks,
        };
        player.receipt = null;

        player.energyUse(selectedObject.energyCost);
        io.to(player.socketId).emit(
          "action:start",
          getDurationFromTicksToMS(selectedObject.durationTicks)
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

        player.actionDurationTicks = {
          value: 0,
          maxValue: receipt.durationTicks,
        };

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
          getDurationFromTicksToMS(receipt.durationTicks)
        );
      });

      socket.on("looting-bag:get-items", ({ selectedItems, name }) => {
        const player = players.get(name);
        const itemsToAdd = selectedItems.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10),
        }));

        let selectedObject = players.get(player.selectedObjectName);

        if (!selectedObject) {
          selectedObject = gameObjects.find(
            (obj) => obj.name === player.selectedObjectName
          );
        }

        if (
          !player ||
          itemsToAdd.length === 0 ||
          selectedObject.type !== "LootingBag" ||
          !player.canInteractWithLootingBag(selectedObject.positionTile) ||
          gameObjects.find((go) => go.name === selectedObject.name) ===
            undefined
        ) {
          return;
        }

        const lootingBagItems = selectedObject.items;

        // make it possible to get backpack from the Looting Bag if player doesn't have any backpack
        if (
          player.equipment.backpack === undefined &&
          itemsToAdd.length === 1 &&
          itemsToAdd[0].quantity === 1
        ) {
          const backpackItem = gameItems.get(itemsToAdd[0].id);

          if (backpackItem.type !== ITEM_TYPES.BACKPACK) {
            return;
          }

          player.addToEquipment(itemsToAdd[0]);
          player.setBackpack(backpackItem.slots);

          const newLootingBagItems = getNewLootingBagItems(
            itemsToAdd,
            lootingBagItems
          );

          removeItemsFromLootingBag({
            gameObjects,
            newLootingBagItems,
            selectedObject,
          });

          emitLootingBagList(gameObjects, io);

          io.emit("dialog:looting-bag:close");

          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );

          player.resetSelected();

          return;
        }

        if (
          !itemsToAdd.every(({ id, quantity }) =>
            lootingBagItems.find(
              (item) =>
                item.id === id && quantity > 0 && quantity <= item.quantity
            )
          )
        ) {
          return;
        }

        if (player.addToBackpack(itemsToAdd)) {
          const newLootingBagItems = getNewLootingBagItems(
            itemsToAdd,
            lootingBagItems
          );

          removeItemsFromLootingBag({
            gameObjects,
            newLootingBagItems,
            selectedObject,
          });

          emitLootingBagList(gameObjects, io);

          io.emit("dialog:looting-bag:close");

          io.to(player.socketId).emit(
            "items:update",
            player.backpack,
            player.equipment
          );

          player.resetSelected();
        }
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
