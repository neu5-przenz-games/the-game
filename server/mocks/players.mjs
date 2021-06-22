import { FRACTIONS } from "../../shared/index.mjs";

const radiantFraction = FRACTIONS[0].name;
const radiantHouse = FRACTIONS[0].houses[0];
const direFraction = FRACTIONS[1].name;
const direHouse = FRACTIONS[1].houses[0];

export default [
  {
    name: "player1",
    displayName: "player 1",
    fraction: radiantFraction,
    positionTile: { tileX: 13, tileY: 6 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [
        { name: "wood", quantity: 1 },
        { name: "sword", quantity: 1 },
        { name: "bow", quantity: 1 },
      ],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: true,
      fight: true,
      showRange: false,
      respawnBuilding: radiantHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "east",
    hp: 100,
    energy: 100,
  },
  {
    name: "player2",
    displayName: "player 2",
    fraction: direFraction,
    positionTile: { tileX: 11, tileY: 10 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      weapon: "bow",
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: false,
      fight: true,
      showRange: false,
      respawnBuilding: direHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "southEast",
    hp: 100,
    energy: 100,
  },
  {
    name: "player3",
    displayName: "player 3",
    fraction: radiantFraction,
    positionTile: { tileX: 19, tileY: 9 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      weapon: "sword",
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: false,
      fight: false,
      showRange: false,
      respawnBuilding: radiantHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "south",
    hp: 100,
    energy: 100,
  },
  {
    name: "player4",
    displayName: "player 4",
    fraction: direFraction,
    positionTile: { tileX: 14, tileY: 12 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      weapon: "sword",
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: false,
      fight: false,
      showRange: false,
      respawnBuilding: direHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "southWest",
    hp: 100,
    energy: 100,
  },
  {
    name: "player5",
    displayName: "player 5",
    fraction: radiantFraction,
    positionTile: { tileX: 12, tileY: 17 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      weapon: "sword",
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: false,
      fight: false,
      showRange: false,
      respawnBuilding: radiantHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "west",
    hp: 100,
    energy: 100,
  },
  {
    name: "player6",
    displayName: "player 6",
    fraction: direFraction,
    positionTile: { tileX: 5, tileY: 12 },
    size: { tileX: 1, tileY: 1 },
    dest: null,
    isWalking: false,
    isDead: false,
    equipment: {
      weapon: "sword",
      backpack: "bag",
    },
    backpack: {
      slots: 4,
      items: [],
    },
    settings: {
      dropSelectedOnMove: true,
      follow: false,
      fight: false,
      showRange: false,
      respawnBuilding: direHouse,
    },
    selectedPlayer: null,
    selectedPlayerTile: null,
    action: null,
    actionDurationTicks: null,
    actionDurationMaxTicks: null,
    dropSelection: false,
    attack: null,
    attackDelayTicks: 30,
    attackDelayMaxTicks: 30,
    energyRegenDelayTicks: 30,
    energyRegenDelayMaxTicks: 30,
    next: null,
    speed: 2,
    isOnline: false,
    socketId: null,
    direction: "northWest",
    hp: 100,
    energy: 100,
  },
];