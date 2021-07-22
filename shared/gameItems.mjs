import { ITEM_TYPES } from "./itemTypes.mjs";

export default {
  armor: {
    id: "armor",
    displayName: "armor",
    imgURL: "armor.png",
    type: ITEM_TYPES.ARMOR,
  },
  arrowsBunch: {
    id: "arrowsBunch",
    displayName: "arrows",
    imgURL: "arrows.png",
    type: ITEM_TYPES.ARROWS,
  },
  backpack_6: {
    id: "backpack_6",
    displayName: "small backpack",
    slots: 6,
    imgURL: "backpack_6.png",
    type: ITEM_TYPES.BACKPACK,
  },
  bag: {
    id: "bag",
    displayName: "bag",
    slots: 4,
    imgURL: "bag.png",
    type: ITEM_TYPES.BACKPACK,
  },
  boots: {
    id: "boots",
    displayName: "boots",
    imgURL: "boots.png",
    type: ITEM_TYPES.BOOTS,
  },
  bow: {
    id: "bow",
    displayName: "bow",
    imgURL: "bow.png",
    type: ITEM_TYPES.WEAPON,
    isTwoHanded: true,
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
  hat: {
    id: "hat",
    displayName: "hat",
    imgURL: "hat.png",
    type: ITEM_TYPES.HELMET,
  },
  pants: {
    id: "pants",
    displayName: "pants",
    imgURL: "pants.png",
    type: ITEM_TYPES.PANTS,
  },
  shield: {
    id: "shield",
    displayName: "shield",
    imgURL: "shield.png",
    type: ITEM_TYPES.SHIELD,
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
  quiver: {
    id: "quiver",
    displayName: "quiver",
    imgURL: "quiver.png",
    type: ITEM_TYPES.QUIVER,
  },
};
