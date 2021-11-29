import {
  Cupid,
  defaultBackpack as CupidBp,
  defaultEquipment as CupidEq,
  HP_MAX as CupidHpMax,
  defaultSkills as CupidSkills,
} from "../../../server/gameObjects/creatures/Cupid.mjs";
import {
  Devil,
  defaultBackpack as DevilBp,
  defaultEquipment as DevilEq,
  HP_MAX as DevilHpMax,
  defaultSkills as DevilSkills,
} from "../../../server/gameObjects/creatures/Devil.mjs";

const createMob = ({
  name,
  displayName,
  type,
  positionTile,
  presenceAreaCenterTile,
  equipment = {},
  backpack = {},
  buffs = [],
  isDead = false,
  defaultState,
  patrollingTiles,
  defaultSkills,
  HP_MAX,
}) => ({
  name,
  displayName,
  type,
  positionTile,
  presenceAreaCenterTile,
  size: { x: 1, y: 1 },
  dest: null,
  isWalking: false,
  buffs,
  isDead,
  equipment,
  backpack,
  skills: defaultSkills,
  settings: {
    attackAlly: false,
    follow: true,
    fight: true,
    keepSelectionOnMovement: true,
  },
  selectedObjectName: null,
  selectedObjectTile: null,
  dropSelection: false,
  attack: null,
  attackDelayTicks: {
    value: 30,
    maxValue: 30,
  },
  respawnDelayTicks: {
    value: 0,
    maxValue: 90,
  },
  getNextDestDelayTicks: {
    value: 0,
    maxValue: 30,
  },
  next: null,
  speed: 2,
  defaultState,
  patrollingTiles,
  direction: "east",
  hp: HP_MAX,
});

const createCupid = ({
  name,
  positionTile,
  presenceAreaCenterTile,
  defaultState,
  patrollingTiles,
}) =>
  createMob({
    displayName: Cupid.DISPLAY_NAME,
    type: Cupid.TYPE,
    backpack: CupidBp,
    equipment: CupidEq,
    defaultSkills: CupidSkills,
    HP_MAX: CupidHpMax,
    name,
    positionTile,
    presenceAreaCenterTile,
    ...(defaultState ? { defaultState } : {}),
    ...(patrollingTiles ? { patrollingTiles } : {}),
  });

const createDevil = ({
  name,
  positionTile,
  presenceAreaCenterTile,
  defaultState,
  patrollingTiles,
}) =>
  createMob({
    displayName: Devil.DISPLAY_NAME,
    type: Devil.TYPE,
    backpack: DevilBp,
    equipment: DevilEq,
    defaultSkills: DevilSkills,
    HP_MAX: DevilHpMax,
    name,
    positionTile,
    presenceAreaCenterTile,
    ...(defaultState ? { defaultState } : {}),
    ...(patrollingTiles ? { patrollingTiles } : {}),
  });

const create = {
  Cupid: createCupid,
  Devil: createDevil,
};

export const mobs = (mobsMocks) => {
  return mobsMocks.map((obj) => {
    try {
      return create[obj.type](obj);
    } catch (err) {
      throw new Error(`Type "${obj.type}" is missing`);
    }
  });
};
