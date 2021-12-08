import Phaser from "phaser";

export const inputs = (game) => {
  game.input.on(Phaser.Input.Events.POINTER_UP, (pointer, obj) => {
    // second parameter (obj) is an array with empty object if player is clicked
    if (obj.length) return;

    const { worldX, worldY } = pointer;

    const clickedTile = game.getTileFromXY(worldX, worldY);

    if (process.env.NODE_ENV === "development") {
      console.log(clickedTile);
    }

    if (clickedTile.x >= 0 && clickedTile.y >= 0) {
      if (game.settings.keepSelectionOnMovement && game.settings.follow) {
        game.settings.follow = false;
        game.profile.UISettings.setFollowCheckbox(false);
      }
      if (!game.settings.keepSelectionOnMovement) {
        game.resetSelectedObject();
      }

      game.socket.emit("player:go", {
        name: game.mainPlayerName,
        tileX: clickedTile.x,
        tileY: clickedTile.y,
      });
    }
  });

  game.input.on("gameobjectdown", (pointer, obj) => {
    if (
      game.UIMenu.classList.contains("show") ||
      !game.profile.UIDialog.wrapper.dialogWrapper.classList.contains("hidden")
    ) {
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
