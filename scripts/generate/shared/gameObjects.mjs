import {
  CopperOre,
  HealingStone,
  House,
  LootingBag,
  Tree,
} from "../../../packages/shared/gameObjects/index.mjs";
import { getSurroundingTiles } from "../../../packages/shared/utils/index.mjs";

const TYPES = {
  CopperOre,
  HealingStone,
  House,
  LootingBag,
  Tree,
};

export const gameObjects = (gameObjectsMocks) => {
  return gameObjectsMocks.map((obj) => {
    try {
      if (obj.type === "HealingStone") {
        const HealingStoneObj = new TYPES[obj.type](obj);

        HealingStoneObj.healingArea = getSurroundingTiles({
          positionTile: obj.positionTile,
          size: HealingStoneObj.size,
          sizeToIncrease: HealingStoneObj.sizeToIncrease,
        });

        return HealingStoneObj;
      }

      return new TYPES[obj.type](obj);
    } catch (err) {
      throw new Error(`Type "${obj.type}" is missing`);
    }
  });
};
