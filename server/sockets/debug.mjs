import {
  DEBUG_ITEMS_SETS,
  DEBUG_PLAYER_SPEED_MAP,
} from "../../shared/debugUtils/index.mjs";
import { gameItems } from "../../shared/init/gameItems/index.mjs";
import { bag } from "../../shared/init/gameItems/backpack.mjs";
import {
  getSkillPoints,
  setSkillPoints,
  shapeSkillsForClient,
} from "../../shared/skills/index.mjs";

export const debugSockets = ({ io, players, socket }) => {
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
    const { equipment, backpackItems = [] } = DEBUG_ITEMS_SETS[itemsSetType];

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

  socket.on("player:speed:set", ({ name, speedType }) => {
    const player = players.get(name);
    const playerSpeed = DEBUG_PLAYER_SPEED_MAP[speedType];

    if (player && playerSpeed) {
      player.setSpeed(playerSpeed);
    }
  });
};
