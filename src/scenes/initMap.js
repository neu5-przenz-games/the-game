export default (game) => {
  const tilemap = game.make.tilemap({ key: "map" });
  const tilesetOutside = tilemap.addTilesetImage("outside", "tileset-outside");

  game.setGroundLayer(tilemap.createLayer("Ground", tilesetOutside));
  tilemap.createLayer("OnGround", tilesetOutside);
  tilemap.createLayer("Collides", tilesetOutside);
  tilemap.createLayer("Above", tilesetOutside);
};
