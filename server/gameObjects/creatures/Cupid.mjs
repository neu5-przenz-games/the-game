import { Creature } from "./Creature.mjs";
import { gameItems } from "../../../shared/init/gameItems/index.mjs";
import { getRandomInt, noObstacles } from "../../utils/algo.mjs";
import { DizzyBuff } from "../../../shared/buffs/index.mjs";
import {
  LEVEL_TYPES,
  getSkillPoints,
  setAllSkillsPoints,
} from "../../../shared/skills/index.mjs";
import { HP_MAX } from "./constants.mjs";

const mobDefaultBackpack = gameItems.get("bag");

const defaultEquipment = {
  armor: { id: "armor", quantity: 1 },
  pants: { id: "pants", quantity: 1 },
  boots: { id: "boots", quantity: 1 },
  backpack: { id: mobDefaultBackpack.id, quantity: 1 },
  weapon: { id: "bow", quantity: 1 },
  quiver: { id: "quiver", quantity: 1 },
  arrows: { id: "arrowsBunch", quantity: 30 },
  helmet: { id: "hat", quantity: 1 },
};

const defaultBackpack = {
  slots: mobDefaultBackpack.slots,
  items: [
    { id: "dagger", quantity: 1 },
    { id: "shield", quantity: 1 },
  ],
};

const defaultSkills = setAllSkillsPoints(getSkillPoints(LEVEL_TYPES.BEGINNER));

class Cupid extends Creature {
  static DISPLAY_NAME = "Cupid";

  static TYPE = "Cupid";

  static ATTACKING_DISTANCE = 8;

  static ESCAPE_DISTANCE = 10;

  setDefaultEquipment() {
    this.setBackpack(defaultBackpack.slots, defaultBackpack.items);
    this.setEquipment(defaultEquipment);
  }

  fightingHook({ finder, map, selectedObject, PF }) {
    if (
      selectedObject !== undefined &&
      !selectedObject.isDead &&
      this.next === null &&
      super.isInRange(super.getWeaponRange(), selectedObject.positionTile) &&
      noObstacles({
        finder,
        map,
        PF,
        positionTile: this.positionTile,
        selectedObjectPositionTile: selectedObject.positionTile,
        hasRangedWeapon: super.hasRangedWeapon(),
      })
    ) {
      super.setSettingsFollow(false);
      this.dest = null;
    } else {
      super.setSettingsFollow(true);
    }
  }

  afterAttackHook(players) {
    if (getRandomInt(0, 1000) <= 100) {
      const selectedObject = players.get(this.selectedObjectName);

      selectedObject.buffs.push(
        new DizzyBuff({
          selectedObjectName: selectedObject.name,
        })
      );
    }
  }
}

export { HP_MAX, Cupid, defaultBackpack, defaultEquipment, defaultSkills };
