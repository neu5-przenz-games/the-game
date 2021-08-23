import { SKILLS_TYPES } from "../../skills/index.mjs";
import { Weapon } from "../../gameItems/index.mjs";

export const bow = new Weapon({
  id: "bow",
  displayName: "Bow",
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

export const fist = new Weapon({
  id: "fist",
  displayName: "Fist",
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
  displayName: "Sword",
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
  displayName: "Dagger",
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

export const weapons = [bow, fist, sword, dagger];
