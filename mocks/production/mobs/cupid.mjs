import { createMob } from "../createMob.mjs";
import {
  Cupid,
  HP_MAX,
  defaultBackpack,
  defaultEquipment,
  defaultSkills,
} from "../../gameObjects/creatures/Cupid.mjs";

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

const cupid1 = createCupid({
  name: "cupid1",
  positionTile: { tileX: 6, tileY: 30 },
  presenceAreaCenterTile: { tileX: 6, tileY: 30 },
});

const cupid2 = createCupid({
  name: "cupid2",
  positionTile: { tileX: 26, tileY: 8 },
  presenceAreaCenterTile: { tileX: 26, tileY: 8 },
});

const cupidsMocks = [/*cupid1, cupid2*/];

export { cupidsMocks };
