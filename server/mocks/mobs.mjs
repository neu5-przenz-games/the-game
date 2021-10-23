import { skillsSchema } from "../../shared/skills/index.mjs";
import {
  backpack as devilBackpack,
  equipment as devilEquipment,
} from "../../shared/mobs/Devil.mjs";
import { Devil, HP_MAX } from "../gameObjects/mobs/Devil.mjs";

const skills = skillsSchema;

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
  getNextDestDelayTicks: 0,
  getNextDestDelayMaxTicks: 30,
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
  backpack: devilBackpack,
  equipment: devilEquipment,
});

const devil2 = createMob({
  name: "devil2",
  displayName: Devil.DISPLAY_NAME,
  type: Devil.TYPE,
  positionTile: { tileX: 26, tileY: 8 },
  presenceAreaCenterTile: { tileX: 26, tileY: 8 },
  backpack: devilBackpack,
  equipment: devilEquipment,
});

const devil3 = createMob({
  name: "devil3",
  displayName: Devil.DISPLAY_NAME,
  type: Devil.TYPE,
  positionTile: { tileX: 1, tileY: 14 },
  presenceAreaCenterTile: { tileX: 1, tileY: 14 },
  backpack: devilBackpack,
  equipment: devilEquipment,
});

export const mobsMocks = [devil1, devil2, devil3];
