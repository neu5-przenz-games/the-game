import gameObjects from "./gameObjects.mjs";
import GAME_ITEMS from "./gameItems.mjs";
import ITEM_ACTIONS from "./itemActions.mjs";
import ITEM_TYPES from "./itemTypes.mjs";
import FRACTIONS from "./fractions.mjs";

const getCurrentWeapon = (itemId) => GAME_ITEMS[itemId] || GAME_ITEMS.fist;

export {
  gameObjects,
  getCurrentWeapon,
  GAME_ITEMS,
  ITEM_ACTIONS,
  ITEM_TYPES,
  FRACTIONS,
};
