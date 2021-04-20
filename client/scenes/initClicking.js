import Phaser from "phaser";

import { OFFSET } from "../gameObjects/Skeleton";

export default (game) => {
  game.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
    const { worldX, worldY } = pointer;

    const clickedTile = game.groundLayer.worldToTileXY(worldX, worldY, true);
    // worldToTileXY method is giving us +1 tile so we need to subtract 1
    clickedTile.x -= 1;
    clickedTile.y -= 1;

    const dest = game.groundLayer.tileToWorldXY(clickedTile.x, clickedTile.y);

    if (clickedTile.x >= 0 && clickedTile.y >= 0) {
      game.socket.emit("playerWishToGo", {
        name: game.mainPlayerName,
        tileX: clickedTile.x,
        tileY: clickedTile.y,
        destX: dest.x + OFFSET.X,
        destY: dest.y + OFFSET.Y,
      });
    }
  });
};
