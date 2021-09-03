import { armor, frozenArmor } from "../init/gameItems/armor.mjs";
import { backpack, bag } from "../init/gameItems/backpack.mjs";
import { frozenBoots, leatherBoots } from "../init/gameItems/boots.mjs";
import { frozenHelmet, hat } from "../init/gameItems/helmet.mjs";
import { frozenPants, leatherPants } from "../init/gameItems/pants.mjs";
import { frozenShield, shield } from "../init/gameItems/shield.mjs";
import {
  bow,
  crossbow,
  dagger,
  frozenAxe,
  frozenSword,
} from "../init/gameItems/weapon.mjs";
import { quiver } from "../init/gameItems/quiver.mjs";
import { arrowsBunch } from "../init/gameItems/arrows.mjs";
import { LEVELS, LEVEL_TYPES } from "../skills/index.mjs";

const DEBUG_ITEMS_SETS_TYPES = {
  ARCHER_BASIC: "ARCHER_BASIC",
  ARCHER_PRO: "ARCHER_PRO",
  WARRIOR_BASIC: "WARRIOR_BASIC",
  WARRIOR_PRO: "WARRIOR_PRO",
};

const DEBUG_ITEMS_SETS = {
  [DEBUG_ITEMS_SETS_TYPES.ARCHER_BASIC]: {
    equipment: {
      backpack: { id: bag.id, quantity: 1 },
      armor: { id: armor.id, quantity: 1 },
      boots: { id: leatherBoots.id, quantity: 1 },
      pants: { id: leatherPants.id, quantity: 1 },
      helmet: { id: hat.id, quantity: 1 },
      quiver: { id: quiver.id, quantity: 1 },
      arrows: { id: arrowsBunch.id, quantity: 100 },
      weapon: { id: bow.id, quantity: 1 },
    },
  },
  [DEBUG_ITEMS_SETS_TYPES.ARCHER_PRO]: {
    equipment: {
      backpack: { id: backpack.id, quantity: 1 },
      armor: { id: frozenArmor.id, quantity: 1 },
      boots: { id: frozenBoots.id, quantity: 1 },
      helmet: { id: frozenHelmet.id, quantity: 1 },
      pants: { id: frozenPants.id, quantity: 1 },
      quiver: { id: quiver.id, quantity: 1 },
      arrows: { id: arrowsBunch.id, quantity: 100 },
      weapon: { id: crossbow.id, quantity: 1 },
    },
  },
  [DEBUG_ITEMS_SETS_TYPES.WARRIOR_BASIC]: {
    equipment: {
      backpack: { id: bag.id, quantity: 1 },
      armor: { id: armor.id, quantity: 1 },
      boots: { id: leatherBoots.id, quantity: 1 },
      pants: { id: leatherPants.id, quantity: 1 },
      shield: { id: shield.id, quantity: 1 },
      weapon: { id: dagger.id, quantity: 1 },
      helmet: { id: hat.id, quantity: 1 },
    },
  },
  [DEBUG_ITEMS_SETS_TYPES.WARRIOR_PRO]: {
    equipment: {
      backpack: { id: backpack.id, quantity: 1 },
      armor: { id: frozenArmor.id, quantity: 1 },
      boots: { id: frozenBoots.id, quantity: 1 },
      helmet: { id: frozenHelmet.id, quantity: 1 },
      pants: { id: frozenPants.id, quantity: 1 },
      shield: { id: frozenShield.id, quantity: 1 },
      weapon: { id: frozenSword.id, quantity: 1 },
    },
    backpackItems: [{ id: frozenAxe.id, quantity: 1 }],
  },
};

const DEBUG_LEVEL_TYPES = {
  NOOB: LEVEL_TYPES.NOOB,
  REGULAR: LEVEL_TYPES.REGULAR,
  EXPERT: LEVEL_TYPES.EXPERT,
};

const DEBUG_SKILL_POINTS = {
  [DEBUG_LEVEL_TYPES.NOOB]: LEVELS.find(
    (level) => level.name === DEBUG_LEVEL_TYPES.NOOB
  ).minPoints,
  [DEBUG_LEVEL_TYPES.REGULAR]: LEVELS.find(
    (level) => level.name === DEBUG_LEVEL_TYPES.REGULAR
  ).minPoints,
  [DEBUG_LEVEL_TYPES.EXPERT]: LEVELS.find(
    (level) => level.name === DEBUG_LEVEL_TYPES.EXPERT
  ).minPoints,
};

export {
  DEBUG_ITEMS_SETS_TYPES,
  DEBUG_ITEMS_SETS,
  DEBUG_LEVEL_TYPES,
  DEBUG_SKILL_POINTS,
};
