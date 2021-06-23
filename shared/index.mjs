import FRACTIONS from "./fractions.mjs";
import GAME_ITEMS from "./gameItems.mjs";
import gameObjects from "./gameObjects.mjs";
import ITEM_ACTIONS from "./itemActions.mjs";
import ITEM_TYPES from "./itemTypes.mjs";

const getCurrentWeapon = (itemId) => GAME_ITEMS[itemId] || GAME_ITEMS.fist;

export {
  getCurrentWeapon,
  FRACTIONS,
  GAME_ITEMS,
  gameObjects,
  ITEM_ACTIONS,
  ITEM_TYPES,
};
