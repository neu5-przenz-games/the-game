import Phaser from "phaser";
import { HealingStone } from "../gameObjects/HealingStone.mjs";
import { House } from "../gameObjects/House.mjs";
import { Tree } from "../gameObjects/Tree.mjs";
import { CopperOre } from "../gameObjects/CopperOre.mjs";
import { LootingBag } from "../gameObjects/LootingBag.mjs";
import { RangedParticleEmitter } from "../utils/index.mjs";
import { gameObjects } from "../../generated/gameObjects.mjs";
import {
  getSurroundingTiles,
  getXYFromTile,
} from "../../shared/utils/index.mjs";

const TYPES = {
  CopperOre,
  HealingStone,
  House,
  LootingBag,
  Tree,
};

export const initGameObjects = (game) => {
  gameObjects.forEach((gameObject) => {
    const objectWorldXY = getXYFromTile(
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
    game.gameObjects.push(object);

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
    if (gameObject.type === "HealingStone") {
      const { positionTile, sizeToIncrease, size } = gameObject;

      const rangeTiles = getSurroundingTiles({
        positionTile,
        size,
        sizeToIncrease,
      });

      // in the future maybe keep it in the array and run only if the player is getting close
      const particleEmitter = new RangedParticleEmitter({
        scene: game,
        particleImgId: "HealingStoneParticle",
        rangeTiles,
      });

      particleEmitter.start();
    }
  });
};
