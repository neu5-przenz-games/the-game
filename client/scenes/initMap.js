export default (game) => {
  const tilemap = game.make.tilemap({ key: "map" });
  const tilesetOutside = tilemap.addTilesetImage("outside", "tileset-outside");

  game.setGroundLayer(tilemap.createLayer("Ground", tilesetOutside));

  const onGroundLayer = tilemap.createLayer("OnGround", tilesetOutside);
  const collidesLayer = tilemap.createLayer("Collides", tilesetOutside);

  for (let y = 0; y < tilemap.height; y += 1) {
    for (let x = 0; x < tilemap.width; x += 1) {
      const tileOnGround = tilemap.getTileAt(x, y, true, onGroundLayer);
      const tileCollides = tilemap.getTileAt(x, y, true, collidesLayer);

      if (tileOnGround.index !== -1) {
        const layer = tilemap.createBlankLayer(
          `Layer onGround ${x}${y}`,
          tilesetOutside,
          0,
          0,
          tilemap.tileWidth,
          tilemap.tileHeight,
          tilemap.tileWidth,
          tilemap.tileWidth
        );
        tilemap.putTileAt(tileOnGround, x, y, true, layer);

        // this is special case for tile.index = 128: it should behind the player
        layer.depth =
          tileOnGround.index === 128
            ? tileOnGround.bottom - 1
            : tileOnGround.bottom + 1;
      }
      if (tileCollides.index !== -1) {
        const layer = tilemap.createBlankLayer(
          `Layer collides ${x}${y}`,
          tilesetOutside,
          0,
          0,
          tilemap.tileWidth,
          tilemap.tileHeight,
          tilemap.tileWidth,
          tilemap.tileWidth
        );
        tilemap.putTileAt(tileCollides, x, y, true, layer);

        layer.depth = tileCollides.bottom + 1;
      }
    }
  }

  tilemap.createLayer("Above", tilesetOutside);
};
