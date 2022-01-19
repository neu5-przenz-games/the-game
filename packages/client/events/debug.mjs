export const debugSockets = (game) => {
  window.e2e = {
    ...window.e2e,
    killPlayer: (playerName) => {
      game.socket.emit("game:killPlayer", {
        name: playerName,
      });
    },
    clearPlayerItems: (playerName) => {
      game.socket.emit("player:items:clear", {
        name: playerName,
      });
    },
    givePlayerABag: (playerName) => {
      game.socket.emit("player:items:give-a-bag", {
        name: playerName,
      });
    },
    setPlayerItems: (playerName, itemsSetType) => {
      game.socket.emit("player:items:set", {
        name: playerName,
        itemsSetType,
      });
    },
    moveItemToBackpackFromEquipment: (playerName, itemID) => {
      game.socket.emit("player:items:move-to-backpack", {
        name: playerName,
        itemID,
      });
    },
    destroyItemFromBackpack: (playerName, itemID) => {
      game.socket.emit("player:items:destroy-from-backpack", {
        name: playerName,
        itemID,
      });
    },
    setPlayerSkills: (playerName, skillType) => {
      game.socket.emit("player:skills:set", {
        name: playerName,
        skillType,
      });
    },
    setPlayerSpeed: (playerName, speedType) => {
      game.socket.emit("player:speed:set", {
        name: playerName,
        speedType,
      });
    },
    teleport: (playerName, teleportDestKey) => {
      game.socket.emit("player:teleport", {
        name: playerName,
        teleportDestKey,
      });
    },
  };
};
