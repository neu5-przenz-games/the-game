import ITEM_TYPES from "./itemTypes.mjs";

export default {
  bag: {
    id: "bag",
    displayName: "bag",
    imgURL: "bag.png",
    type: ITEM_TYPES.BACKPACK,
  },
  bow: {
    id: "bow",
    displayName: "bow",
    imgURL: "bow.png",
    type: ITEM_TYPES.WEAPON,
    weapon: {
      attack: 15,
      range: 5,
    },
  },
  "copper ore": {
    id: "copper ore",
    displayName: "copper ore",
    imgURL: "copper-ore.png",
    type: ITEM_TYPES.RESOURCE,
    // @TODO: Implement basic crafting #190
    craft: {
      sword: () => {},
    },
  },
  fist: {
    id: "fist",
    displayName: "fist",
    type: ITEM_TYPES.WEAPON,
    weapon: {
      attack: 5,
      range: 1,
    },
  },
  sword: {
    id: "sword",
    displayName: "sword",
    imgURL: "sword.png",
    type: ITEM_TYPES.WEAPON,
    weapon: {
      attack: 20,
      range: 1,
    },
  },
  wood: {
    id: "wood",
    displayName: "wood",
    imgURL: "wood.png",
    type: ITEM_TYPES.RESOURCE,
    // @TODO: Implement basic crafting #190
    craft: {
      arrows: () => {},
      bow: () => {},
      shield: () => {},
      spike: () => {},
    },
  },
};
