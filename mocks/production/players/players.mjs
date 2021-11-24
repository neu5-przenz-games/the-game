import { FRACTIONS } from "../../../shared/fractions/index.mjs";
import { skillsSchema } from "../../../shared/skills/index.mjs";
import { ENERGY_MAX, HP_MAX } from "../../gameObjects/creatures/Player.mjs";

const radiantFraction = FRACTIONS[0].name;
const radiantHouse = FRACTIONS[0].houses[0];
const direFraction = FRACTIONS[1].name;
const direHouse = FRACTIONS[1].houses[0];
const skills = skillsSchema;

export const playersMocks = [
  {
    name: "player1",
    displayName: "player 1",
    fraction: radiantFraction,
    positionTile: { tileX: 54, tileY: 48 },
    size: { x: 1, y: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    buffs: [],
    defaultState: "IDLE",
    equipment: {
      armor: { id: "armor", quantity: 1 },
      pants: { id: "pants", quantity: 1 },
      boots: { id: "boots", quantity: 1 },
      backpack: { id: "backpack", quantity: 1 },
      shield: { id: "shield", quantity: 1 },
      weapon: { id: "sword", quantity: 1 },
      helmet: { id: "hat", quantity: 1 },
      quiver: { id: "quiver", quantity: 1 },
      arrows: { id: "arrowsBunch", quantity: 10 },
    },
    backpack: {
      slots: 6,
      items: [
        { id: "bag", quantity: 1 },
        { id: "wood", quantity: 2 },
        { id: "bow", quantity: 1 },
        { id: "dagger", quantity: 1 },
      ],
    },
    skills,
    settings: {
      attackAlly: false,
      follow: true,
      fight: true,
      showRange: false,
      keepSelectionOnMovement: false,
      respawnBuilding: radiantHouse,
    },
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
  },
  {
    name: "player2",
    displayName: "player 2",
    fraction: direFraction,
    positionTile: { tileX: 55, tileY: 50 },
    size: { x: 1, y: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    buffs: [],
    defaultState: "IDLE",
    equipment: {
      weapon: { id: "bow", quantity: 1 },
      backpack: { id: "bag", quantity: 1 },
    },
    backpack: {
      slots: 4,
      items: [{ id: "sword", quantity: 1 }],
    },
    skills,
    settings: {
      attackAlly: false,
      follow: true,
      fight: true,
      showRange: false,
      keepSelectionOnMovement: false,
      respawnBuilding: direHouse,
    },
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
    direction: "southEast",
    hp: HP_MAX,
    energy: ENERGY_MAX,
  },
];
