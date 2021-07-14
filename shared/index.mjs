import {
  gameObjects,
  getAction,
  getDuration,
  getItem,
} from "./gameObjects.mjs";
import GAME_ITEMS from "./gameItems.mjs";
import ITEM_ACTIONS from "./itemActions.mjs";
import { ITEM_TYPES, WEARABLE_TYPES } from "./itemTypes.mjs";
import FRACTIONS from "./fractions.mjs";

const getCurrentWeapon = (item) =>
  GAME_ITEMS[item && item.id] || GAME_ITEMS.fist;

export {
  gameObjects,
  getAction,
  getDuration,
  getItem,
  getCurrentWeapon,
  GAME_ITEMS,
  ITEM_ACTIONS,
  ITEM_TYPES,
  FRACTIONS,
  WEARABLE_TYPES,
};
