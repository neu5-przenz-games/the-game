import { skillsSchema } from "../../shared/skills/index.mjs";
import { HP_MAX } from "../gameObjects/mobs/Devil.mjs";

const skills = skillsSchema;

export const mobsMocks = [
  {
    name: "devil1",
    displayName: "Devil",
    type: "Devil",
    positionTile: { tileX: 25, tileY: 25 },
    size: { x: 1, y: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      armor: { id: "armor", quantity: 1 },
      pants: { id: "pants", quantity: 1 },
      boots: { id: "boots", quantity: 1 },
      backpack: { id: "bag", quantity: 1 },
      shield: { id: "shield", quantity: 1 },
      weapon: { id: "dagger", quantity: 1 },
      helmet: { id: "hat", quantity: 1 },
    },
    backpack: {
      slots: 4,
      items: [{ id: "bow", quantity: 1 }],
    },
    skills,
    settings: {
      attackAlly: false,
      follow: true,
      fight: true,
      showRange: false,
      keepSelectionOnMovement: false,
    },
    selectedObject: null,
    selectedObjectTile: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    direction: "east",
    hp: HP_MAX,
  },
];
