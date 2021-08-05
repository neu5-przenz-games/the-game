import {
  gameObjects,
  getAction,
  getDuration,
  getEnergyCost,
  getItem,
  getSkillDetails,
} from "./gameObjects.mjs";
import GAME_ITEMS from "./gameItems.mjs";
import ITEM_ACTIONS from "./itemActions.mjs";
import { ITEM_TYPES, WEARABLE_TYPES } from "./itemTypes.mjs";
import FRACTIONS from "./fractions.mjs";
import receipts from "./receipts.mjs";
import {
  shapeSkillsForClient,
  skillIncrease,
  skillsSchema,
} from "./skills.mjs";

const getCurrentWeapon = (item) =>
  GAME_ITEMS[item && item.id] || GAME_ITEMS.fist;

export {
  gameObjects,
  getAction,
  getCurrentWeapon,
  getDuration,
  getEnergyCost,
  getItem,
  getSkillDetails,
  receipts,
  shapeSkillsForClient,
  skillIncrease,
  skillsSchema,
  GAME_ITEMS,
  ITEM_ACTIONS,
  ITEM_TYPES,
  FRACTIONS,
  WEARABLE_TYPES,
};
