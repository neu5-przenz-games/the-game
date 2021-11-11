import { createMob } from "../createMob.mjs";
import {
  Devil,
  HP_MAX,
  defaultBackpack,
  defaultEquipment,
  defaultSkills,
} from "../../gameObjects/creatures/Devil.mjs";

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
    backpack: defaultBackpack,
    equipment: defaultEquipment,
    defaultSkills,
    HP_MAX,
    name,
    positionTile,
    presenceAreaCenterTile,
    ...(defaultState ? { defaultState } : {}),
    ...(patrollingTiles ? { patrollingTiles } : {}),
  });

const devil1 = createDevil({
  name: "devil1",
  positionTile: { tileX: 20, tileY: 25 },
  presenceAreaCenterTile: { tileX: 20, tileY: 25 },
  defaultState: "PATROLLING",
  patrollingTiles: [
    { tileX: 19, tileY: 27 },
    { tileX: 27, tileY: 19 },
  ],
});

const devil2 = createDevil({
  name: "devil2",
  positionTile: { tileX: 1, tileY: 14 },
  presenceAreaCenterTile: { tileX: 1, tileY: 14 },
});

const devilsMocks = [devil1, devil2];

export { devilsMocks };
