import Phaser from "phaser";

export default (game) => {
  game.input.on(Phaser.Input.Events.POINTER_UP, (pointer, obj) => {
    // second parameter (obj) is an array with empty object if player is clicked
    if (obj.length) return;

    const { worldX, worldY } = pointer;

    const clickedTile = game.groundLayer.worldToTileXY(worldX, worldY, true);
    // worldToTileXY method is giving us +1 tile so we need to subtract 1
    clickedTile.x -= 1;
    clickedTile.y -= 1;

    if (clickedTile.x >= 0 && clickedTile.y >= 0) {
      game.resetSelectedObject();

      game.socket.emit("player:go", {
        name: game.mainPlayerName,
        tileX: clickedTile.x,
        tileY: clickedTile.y,
      });
    }
  });

  game.input.on("gameobjectdown", (pointer, obj) => {
    if (game.UIMenu.classList.contains("show")) {
      return;
    }

    if (game.mainPlayerName !== obj.name && !game.mainPlayer.isDead) {
      game.setSelectedObject({
        name: obj.name,
        type: obj.constructor.TYPE,
      });

      game.profile.enableSelectionButton();
      game.profile.setSelectedName(obj.displayName);

      game.socket.emit("player:selection:add", {
        name: game.mainPlayerName,
        selectedObjectName: obj.name,
        type: obj.constructor.TYPE,
      });
    } else {
      game.resetSelectedObject();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && game.chat.message) {
      game.socket.emit("player:message:send", {
        name: game.mainPlayerName,
        text: game.chat.message,
      });
      game.chat.addOwnMessage();
      game.chat.clearInput();
    }
  });
};
