import Phaser from "phaser";
import House from "../gameObjects/House";
import Tree from "../gameObjects/Tree";
import Ore from "../gameObjects/Ore";

import gameObjects from "../../public/assets/map/gameObjects";

const TYPES = {
  House,
  Tree,
  Ore,
};

export default (game) => {
  gameObjects.forEach((gameObject) => {
    const objectWorldXY = game.groundLayer.tileToWorldXY(
      gameObject.positionTile.tileX,
      gameObject.positionTile.tileY
    );

    const Type = TYPES[gameObject.type];

    const object = new Type(
      game,
      objectWorldXY.x,
      objectWorldXY.y,
      gameObject.type,
      gameObject.name
    );

    game.add.existing(object);

    if (Type.hitAreaPoly) {
      object.setInteractive(
        new Phaser.Geom.Polygon(Type.hitAreaPoly),
        Phaser.Geom.Polygon.Contains
      );
    } else {
      object.setInteractive();
    }
  });
};
