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
    damage: [50, 100],
    range: 5,
    attackDelayTicks: 40,
    energyCost: 50,
  },
});

export const crossbow = new Weapon({
  id: "crossbow",
  displayName: "Crossbow",
  imgURL: "crossbow.png",
  isTwoHanded: true,
  skillToIncrease: {
    name: SKILLS_TYPES.ARCHERY_FIGHTING,
    pointsToGain: 20,
  },
  details: {
    damage: [100, 500],
    range: 7,
    attackDelayTicks: 80,
    energyCost: 50,
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
    damage: [10, 50],
    range: 1,
    attackDelayTicks: 20,
    energyCost: 50,
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
    damage: [50, 100],
    range: 1,
    attackDelayTicks: 30,
    energyCost: 50,
  },
});

export const dagger = new Weapon({
  id: "dagger",
  displayName: "Dagger",
  imgURL: "dagger.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SWORD_FIGHTING,
    pointsToGain: 2,
  },
  details: {
    damage: [20, 50],
    range: 1,
    attackDelayTicks: 20,
    energyCost: 50,
  },
});

export const frozenAxe = new Weapon({
  id: "frozenAxe",
  displayName: "Frozen Axe",
  imgURL: "frozen_axe.png",
  skillToIncrease: {
    name: SKILLS_TYPES.AXE_FIGHTING,
    pointsToGain: 20,
  },
  details: {
    damage: [100, 2000],
    range: 1,
    attackDelayTicks: 60,
    energyCost: 50,
  },
});

export const weapons = [bow, crossbow, fist, sword, dagger, frozenAxe];
