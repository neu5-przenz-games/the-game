import Phaser from "phaser";
import { gameObjects } from "../../shared/init/gameObjects.mjs";
import { HealingStone } from "../gameObjects/HealingStone.mjs";
import { House } from "../gameObjects/House.mjs";
import { Tree } from "../gameObjects/Tree.mjs";
import { Ore } from "../gameObjects/Ore.mjs";

const TYPES = {
  HealingStone,
  House,
  Tree,
  Ore,
};

export const initGameObjects = (game) => {
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
      gameObject.name,
      gameObject.displayName
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

    if (gameObject.displayName && gameObject.type === "House") {
      const HOUSE_LABEL_OFFSET = 50;
      const label = object.scene.add
        .text(object.x, object.y, object.displayName, {
          font: "12px Verdana",
          stroke: "#333",
          strokeThickness: 2,
        })
        .setOrigin(0.5, 2)
        .setPosition(object.x, object.y - HOUSE_LABEL_OFFSET);
      label.depth = object.depth;
    }
  });
};
