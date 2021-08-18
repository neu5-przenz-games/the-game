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
  id: "armor",
  displayName: "armor",
  imgURL: "armor.png",
});

export const arrowsBunch = new Arrows({
  id: "arrowsBunch",
  displayName: "arrows",
  imgURL: "arrows.png",
});

const bag = new Backpack({
  id: "bag",
  displayName: "bag",
  imgURL: "bag.png",
  slots: 4,
});

const backpack = new Backpack({
  id: "backpack",
  displayName: "backpack",
  imgURL: "backpack_6.png",
  slots: 6,
});

const boots = new Boots({
  id: "boots",
  displayName: "boots",
  imgURL: "boots.png",
});

const hat = new Helmet({
  id: "hat",
  displayName: "hat",
  imgURL: "hat.png",
});

const pants = new Pants({
  id: "pants",
  displayName: "pants",
  imgURL: "pants.png",
});

const shield = new Shield({
  id: "shield",
  displayName: "shield",
  imgURL: "shield.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SHIELD_DEFENDING,
    pointsToGain: 5,
  },
  details: {
    defence: 5,
  },
});

export const bow = new Weapon({
  id: "bow",
  displayName: "bow",
  imgURL: "bow.png",
  isTwoHanded: true,
  skillToIncrease: {
    name: SKILLS_TYPES.ARCHERY_FIGHTING,
    pointsToGain: 5,
  },
  details: {
    damage: 15,
    range: 5,
    attackDelayTicks: 20,
    energyCost: 15,
  },
});

const fist = new Weapon({
  id: "fist",
  displayName: "fist",
  skillToIncrease: {
    name: SKILLS_TYPES.FIST_FIGHTING,
    pointsToGain: 5,
  },
  details: {
    damage: 5,
    range: 1,
    attackDelayTicks: 20,
    energyCost: 10,
  },
});

const sword = new Weapon({
  id: "sword",
  displayName: "sword",
  imgURL: "sword.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SWORD_FIGHTING,
    pointsToGain: 5,
  },
  details: {
    damage: 20,
    range: 1,
    attackDelayTicks: 30,
    energyCost: 15,
  },
});

const dagger = new Weapon({
  id: "dagger",
  displayName: "dagger",
  imgURL: "dagger.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SWORD_FIGHTING,
    pointsToGain: 2,
  },
  details: {
    damage: 10,
    range: 1,
    attackDelayTicks: 20,
    energyCost: 10,
  },
});

const quiver = new Quiver({
  id: "quiver",
  displayName: "quiver",
  imgURL: "quiver.png",
});

export const copperOre = new Resource({
  id: "copper ore",
  displayName: "copper ore",
  imgURL: "copper-ore.png",
});

export const wood = new Resource({
  id: "wood",
  displayName: "wood",
  imgURL: "wood.png",
});

const gameItems = new Map();

gameItems.set(armor.id, armor);
gameItems.set(boots.id, boots);
gameItems.set(hat.id, hat);
gameItems.set(pants.id, pants);

gameItems.set(backpack.id, backpack);
gameItems.set(bag.id, bag);

gameItems.set(arrowsBunch.id, arrowsBunch);
gameItems.set(quiver.id, quiver);

gameItems.set(shield.id, shield);
gameItems.set(bow.id, bow);
gameItems.set(fist.id, fist);
gameItems.set(sword.id, sword);
gameItems.set(dagger.id, dagger);

gameItems.set(copperOre.id, copperOre);
gameItems.set(wood.id, wood);

export const getCurrentWeapon = (item) =>
  item && item.id ? gameItems.get(item.id) : fist;

export default gameItems;
