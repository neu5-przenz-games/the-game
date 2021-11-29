import {
  CopperOre,
  HealingStone,
  House,
  Tree,
} from "../../../shared/gameObjects/index.mjs";

const TYPES = {
  HealingStone,
  House,
  Tree,
  CopperOre,
};

export const gameObjects = (gameObjectsMocks) => {
  return gameObjectsMocks.map((obj) => {
    try {
      return new TYPES[obj.type](obj);
    } catch (err) {
      throw new Error(`Type "${obj.type}" is missing`);
    }
  });
};
