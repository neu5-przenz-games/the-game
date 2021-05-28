import Phaser from "phaser";
import Skeleton from "../gameObjects/Skeleton";

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

      game.socket.emit("playerWishToGo", {
        name: game.mainPlayerName,
        tileX: clickedTile.x,
        tileY: clickedTile.y,
      });
    }
  });

  game.input.on("gameobjectdown", (pointer, obj) => {
    if (game.mainPlayerName !== obj.name && !game.mainPlayer.isDead) {
      game.setSelectedObject({
        name: obj.name,
        type: obj.constructor.name,
      });

      game.profile.enableSelectionButton();
      game.profile.setSelectedName(obj.name);

      game.socket.emit("selectPlayer", {
        name: game.mainPlayerName,
        selectedObjectName: obj.name,
        type: obj.constructor.name,
      });
    } else {
      game.resetSelectedObject();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && game.chat.message) {
      game.socket.emit("chatMessage", {
        name: game.mainPlayerName,
        text: game.chat.message,
      });
      game.chat.addOwnMessage();
      game.chat.clearInput();
    }
  });
};
