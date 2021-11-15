import { Creature } from "./Creature.mjs";
import { gameItems } from "../../../shared/init/gameItems/index.mjs";
import {
  LEVEL_TYPES,
  getSkillPoints,
  setAllSkillsPoints,
} from "../../../shared/skills/index.mjs";
import { getRandomInt } from "../../utils/algo.mjs";
import { FireBuff } from "../../../shared/buffs/index.mjs";
import { HP_MAX } from "./constants.mjs";

const mobDefaultBackpack = gameItems.get("bag");

const defaultEquipment = {
  armor: { id: "armor", quantity: 1 },
  pants: { id: "pants", quantity: 1 },
  boots: { id: "boots", quantity: 1 },
  backpack: { id: mobDefaultBackpack.id, quantity: 1 },
  shield: { id: "shield", quantity: 1 },
  weapon: { id: "dagger", quantity: 1 },
  helmet: { id: "hat", quantity: 1 },
};

const defaultBackpack = {
  slots: mobDefaultBackpack.slots,
  items: [{ id: "bow", quantity: 1 }],
};

const defaultSkills = setAllSkillsPoints(getSkillPoints(LEVEL_TYPES.BEGINNER));

class Devil extends Creature {
  static DISPLAY_NAME = "Devil";

  static TYPE = "Devil";

  static ATTACKING_DISTANCE = 8;

  static ESCAPE_DISTANCE = 10;

  setDefaultEquipment() {
    this.setBackpack(defaultBackpack.slots, defaultBackpack.items);
    this.setEquipment(defaultEquipment);
  }

  afterAttackHook(players) {
    if (getRandomInt(0, 1000) <= 100) {
      const selectedObject = players.get(this.selectedObjectName);

      selectedObject.buffs.push(
        new FireBuff({
          selectedObjectName: selectedObject.name,
        })
      );
    }
  }
}

export { HP_MAX, Devil, defaultBackpack, defaultEquipment, defaultSkills };
