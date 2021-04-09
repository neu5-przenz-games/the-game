import Phaser from "phaser";

const markAndfadeOutTile = (tile) => {
  tile.setAlpha(0.6);

  setTimeout(() => {
    tile.setAlpha(0.7);
  }, 100);
  setTimeout(() => {
    tile.setAlpha(0.8);
  }, 200);
  setTimeout(() => {
    tile.setAlpha(0.9);
  }, 300);
  setTimeout(() => {
    tile.setAlpha(1);
  }, 400);
};

export default (game) => {
  let lastTime = 0;
  let prevPointer = { x: null, y: null };

  game.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
    const clickDelay = game.time.now - lastTime;
    const { worldX, worldY } = pointer;

    const clickedTile = game.groundLayer.worldToTileXY(worldX, worldY, true);
    // worldToTileXY method is giving us +1 tile so we need to subtract 1
    clickedTile.x -= 1;
    clickedTile.y -= 1;

    if (clickedTile.x >= 0 && clickedTile.y >= 0) {
      markAndfadeOutTile(
        game.groundLayer.getTileAt(clickedTile.x, clickedTile.y)
      );

      if (
        clickedTile.x === prevPointer.x &&
        clickedTile.y === prevPointer.y &&
        clickDelay < 400
      ) {
        game.socket.emit("playerWishToGo", {
          name: game.mainPlayerName,
          x: clickedTile.x,
          y: clickedTile.y,
        });
      }

      lastTime = game.time.now;
      prevPointer = clickedTile;
    }
  });
};
