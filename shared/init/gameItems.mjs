import {
  Armor,
  Arrows,
  Backpack,
  Boots,
  Helmet,
  Pants,
  Quiver,
  Resource,
  Shield,
  Weapon,
} from "../gameItems/index.mjs";
import { SKILLS_TYPES } from "../skills/index.mjs";

const armor = new Armor({
  name: "armor",
  displayName: "armor",
  imgURL: "armor.png",
});

const arrowsBunch = new Arrows({
  name: "arrowsBunch",
  displayName: "arrows",
  imgURL: "arrows.png",
});

const bag = new Backpack({
  name: "bag",
  displayName: "bag",
  imgURL: "bag.png",
  slots: 4,
});

const backpack = new Backpack({
  name: "backpack",
  displayName: "backpack",
  imgURL: "backpack_6.png",
  slots: 6,
});

const boots = new Boots({
  name: "boots",
  displayName: "boots",
  imgURL: "boots.png",
});

const hat = new Helmet({
  name: "hat",
  displayName: "hat",
  imgURL: "hat.png",
});

const pants = new Pants({
  name: "pants",
  displayName: "pants",
  imgURL: "pants.png",
});

const shield = new Shield({
  name: "shield",
  displayName: "shield",
  imgURL: "shield.png",
  skill: {
    name: SKILLS_TYPES.SHIELD_DEFENDING,
    pointsToGain: 5,
  },
  weapon: {
    defending: 5,
  },
});

const bow = new Weapon({
  name: "bow",
  displayName: "bow",
  imgURL: "bow.png",
  isTwoHanded: true,
  skill: {
    name: SKILLS_TYPES.ARCHERY_FIGHTING,
    pointsToGain: 5,
  },
  weapon: {
    attack: 15,
    range: 5,
  },
});

const fist = new Weapon({
  name: "fist",
  displayName: "fist",
  skill: {
    name: SKILLS_TYPES.FIST_FIGHTING,
    pointsToGain: 5,
  },
  weapon: {
    attack: 5,
    range: 1,
  },
});

const sword = new Weapon({
  name: "sword",
  displayName: "sword",
  imgURL: "sword.png",
  skill: {
    name: SKILLS_TYPES.SWORD_FIGHTING,
    pointsToGain: 5,
  },
  weapon: {
    attack: 20,
    range: 1,
  },
});

const quiver = new Quiver({
  name: "quiver",
  displayName: "quiver",
  imgURL: "quiver.png",
});

const cooperOre = new Resource({
  name: "copper ore",
  displayName: "copper ore",
  imgURL: "copper-ore.png",
});

const wood = new Resource({
  name: "wood",
  displayName: "wood",
  imgURL: "wood.png",
});

const gameItems = new Map();

gameItems.set(armor.name, armor);
gameItems.set(boots.name, boots);
gameItems.set(hat.name, hat);
gameItems.set(pants.name, pants);

gameItems.set(backpack.name, backpack);
gameItems.set(bag.name, bag);

gameItems.set(arrowsBunch.name, arrowsBunch);
gameItems.set(quiver.name, quiver);

gameItems.set(shield.name, shield);
gameItems.set(bow.name, bow);
gameItems.set(fist.name, fist);
gameItems.set(sword.name, sword);

gameItems.set(cooperOre.name, cooperOre);
gameItems.set(wood.name, wood);

export const getCurrentWeapon = (item) =>
  item && item.id ? gameItems.get(item.id) : fist;

export default gameItems;
