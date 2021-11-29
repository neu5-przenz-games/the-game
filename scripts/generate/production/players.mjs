import {
  ENERGY_MAX,
  HP_MAX,
} from "../../../server/gameObjects/creatures/Player.mjs";

import { skillsSchema } from "../../../shared/skills/index.mjs";

const createPlayer = ({
  name,
  displayName,
  fraction,
  positionTile,
  equipment = {},
  backpack = {
    slots: 0,
    items: [],
  },
  settings = {
    attackAlly: false,
    follow: true,
    fight: true,
    showRange: false,
    keepSelectionOnMovement: false,
    respawnBuilding: "house_radiant",
  },
}) => ({
  name,
  displayName,
  fraction,
  positionTile,
  equipment,
  backpack,
  settings,
  size: { x: 1, y: 1 },
  dest: null,
  isWalking: false,
  isDead: false,
  buffs: [],
  defaultState: "IDLE",
  skills: skillsSchema,
  selectedObjectName: null,
  selectedObjectTile: null,
  receipt: null,
  action: null,
  actionDurationTicks: null,
  dropSelection: false,
  attack: null,
  attackDelayTicks: {
    value: 30,
    maxValue: 30,
  },
  energyRegenDelayTicks: {
    value: 30,
    maxValue: 30,
  },
  next: null,
  speed: 2,
  isOnline: false,
  socketId: null,
  direction: "east",
  hp: HP_MAX,
  energy: ENERGY_MAX,
});

export const players = (playersMocks) => {
  return playersMocks.map(createPlayer);
};
