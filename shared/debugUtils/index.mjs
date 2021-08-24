import { armor, frozenArmor } from "../init/gameItems/armor.mjs";
import { backpack, bag } from "../init/gameItems/backpack.mjs";
import { frozenBoots, leatherBoots } from "../init/gameItems/boots.mjs";
import { frozenHelmet, hat } from "../init/gameItems/helmet.mjs";
import { frozenPants, leatherPants } from "../init/gameItems/pants.mjs";
import { frozenShield, shield } from "../init/gameItems/shield.mjs";
import { dagger, frozenAxe } from "../init/gameItems/weapon.mjs";

export const DEBUG_ITEMS_SETS_TYPES = {
  ARCHER_BASIC: "ARCHER_BASIC",
  ARCHER_PRO: "ARCHER_PRO",
  WARRIOR_BASIC: "WARRIOR_BASIC",
  WARRIOR_PRO: "WARRIOR_PRO",
};

export const DEBUG_ITEMS_SETS = {
  [DEBUG_ITEMS_SETS_TYPES.ARCHER_BASIC]: {},
  [DEBUG_ITEMS_SETS_TYPES.ARCHER_PRO]: {},
  [DEBUG_ITEMS_SETS_TYPES.WARRIOR_BASIC]: {
    backpack: { id: bag.id, quantity: 1 },
    armor: { id: armor.id, quantity: 1 },
    boots: { id: leatherBoots.id, quantity: 1 },
    pants: { id: leatherPants.id, quantity: 1 },
    shield: { id: shield.id, quantity: 1 },
    weapon: { id: dagger.id, quantity: 1 },
    helmet: { id: hat.id, quantity: 1 },
  },
  [DEBUG_ITEMS_SETS_TYPES.WARRIOR_PRO]: {
    backpack: { id: backpack.id, quantity: 1 },
    armor: { id: frozenArmor.id, quantity: 1 },
    boots: { id: frozenBoots.id, quantity: 1 },
    helmet: { id: frozenHelmet.id, quantity: 1 },
    pants: { id: frozenPants.id, quantity: 1 },
    shield: { id: frozenShield.id, quantity: 1 },
    weapon: { id: frozenAxe.id, quantity: 1 },
  },
};
