import { skillsSchema } from "../../shared/skills/index.mjs";
import { Devil, HP_MAX } from "../gameObjects/mobs/Devil.mjs";

const skills = skillsSchema;

const eq = {
  armor: { id: "armor", quantity: 1 },
  pants: { id: "pants", quantity: 1 },
  boots: { id: "boots", quantity: 1 },
  backpack: { id: "bag", quantity: 1 },
  shield: { id: "shield", quantity: 1 },
  weapon: { id: "dagger", quantity: 1 },
  helmet: { id: "hat", quantity: 1 },
};

const bp = {
  slots: 4,
  items: [{ id: "bow", quantity: 1 }],
};

const createMob = ({
  name,
  displayName,
  type,
  positionTile,
  presenceAreaCenterTile,
  equipment = {},
  backpack = {},
  isDead = false,
}) => ({
  name,
  displayName,
  type,
  positionTile,
  presenceAreaCenterTile,
  size: { x: 1, y: 1 },
  dest: null,
  isWalking: false,
  isDead,
  equipment,
  backpack,
  skills,
  settings: {
    attackAlly: false,
    follow: true,
    fight: true,
    keepSelectionOnMovement: true,
  },
  selectedObject: null,
  selectedObjectTile: null,
  dropSelection: false,
  attack: null,
  attackDelayTicks: 30,
  attackDelayMaxTicks: 30,
  respawnDelayTicks: 0,
  respawnDelayMaxTicks: 90,
  next: null,
  speed: 2,
  direction: "east",
  hp: HP_MAX,
});

const devil1 = createMob({
  name: "devil1",
  displayName: Devil.DISPLAY_NAME,
  type: Devil.TYPE,
  positionTile: { tileX: 25, tileY: 25 },
  presenceAreaCenterTile: { tileX: 25, tileY: 25 },
  equipment: eq,
  backpack: bp,
});

const devil2 = createMob({
  name: "devil2",
  displayName: Devil.DISPLAY_NAME,
  type: Devil.TYPE,
  positionTile: { tileX: 26, tileY: 8 },
  presenceAreaCenterTile: { tileX: 26, tileY: 8 },
  equipment: eq,
  backpack: bp,
});

const devil3 = createMob({
  name: "devil3",
  displayName: Devil.DISPLAY_NAME,
  type: Devil.TYPE,
  positionTile: { tileX: 1, tileY: 14 },
  presenceAreaCenterTile: { tileX: 1, tileY: 14 },
  equipment: eq,
  backpack: bp,
});

export const mobsMocks = [devil1, devil2, devil3];
