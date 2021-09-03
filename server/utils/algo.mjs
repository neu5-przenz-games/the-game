import { TILE_HALF, TILE_QUARTER } from "./constants.mjs";
import { getSurroundingTiles } from "../../shared/utils/index.mjs";
import { gameItems } from "../../shared/init/gameItems/index.mjs";
import { LEVEL_TYPES, getLevel } from "../../shared/skills/index.mjs";

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

const getDefenceSum = (eq) => {
  return Object.values(eq).reduce((defence, item) => {
    const itemSchema = gameItems.get(item.id);

    return itemSchema?.details?.defence
      ? defence + itemSchema.details.defence
      : defence;
  }, 0);
};

const getDmg = ({ player, currentWeapon }) => {
  const weaponSkill = currentWeapon.skillToIncrease.name;

  const skillLevel = getLevel(player.skills[weaponSkill].points);

  const SKILL_TO_NUM = {
    [LEVEL_TYPES.NOOB]: 1,
    [LEVEL_TYPES.BEGINNER]: 2,
    [LEVEL_TYPES.REGULAR]: 3,
    [LEVEL_TYPES.ADVANCED]: 4,
    [LEVEL_TYPES.EXPERT]: 5,
    [LEVEL_TYPES.MASTER]: 6,
  };

  const LVL_NUM = Object.values(SKILL_TO_NUM).length;

  let [minDmg, maxDmg] = currentWeapon.details.damage;

  // ranged weapon
  if (currentWeapon.details.range > 1) {
    const arrowSchema = gameItems.get(player.equipment.arrows.id);

    const [arrowsDmgMin, arrowsDmgMax] = arrowSchema.details.damage;

    minDmg += arrowsDmgMin;
    maxDmg += arrowsDmgMax;
  }

  const skillToNum = SKILL_TO_NUM[skillLevel.name];

  const diff = Math.floor((maxDmg - minDmg) / LVL_NUM);

  const dmgRangeStart = Math.floor(minDmg + diff * (skillToNum - 1));
  const dmgRangeEnd = dmgRangeStart + diff;

  return getRandomInt(dmgRangeStart, dmgRangeEnd);
};

const getAllies = (players, fraction) =>
  Array.from(players).reduce((allies, [name, player]) => {
    if (player.fraction === fraction) {
      allies.push({
        name,
        hp: player.hp,
      });
    }

    return allies;
  }, []);

const getChebyshevDistance = (currTile, destTile) => {
  const distX = Math.abs(currTile.tileX - destTile.tileX);
  const distY = Math.abs(currTile.tileY - destTile.tileY);

  return Math.max(distX, distY);
};

const availableTiles = ({ surroundingTiles, players, map }) => {
  const tiles = [...surroundingTiles];
  const currentPlayersPositions = [];

  players.forEach((player) => {
    currentPlayersPositions.push(player.positionTile);
  });

  return tiles.reduce((avTiles, tile) => {
    if (
      map[tile.tileY][tile.tileX] === 0 &&
      currentPlayersPositions.every(
        (pos) => pos.tileX !== tile.tileX || pos.tileY !== tile.tileY
      )
    ) {
      avTiles.push(tile);
    }

    return avTiles;
  }, []);
};

const getRespawnTile = ({ map, obj, players, sizeToIncrease }) => {
  const { positionTile, size } = obj;

  const respawnTiles = availableTiles({
    surroundingTiles: getSurroundingTiles({
      positionTile,
      size,
      sizeToIncrease,
    }),
    players,
    map,
  });

  return respawnTiles[getRandomInt(0, respawnTiles.length - 1)];
};

const getXYFromTile = (tileX, tileY) => ({
  x: tileX * TILE_HALF - tileY * TILE_HALF,
  y: tileX * TILE_QUARTER + tileY * TILE_QUARTER,
});

const getDestTile = (player, { map, obj, players }) => {
  const { size } = obj;
  const surroundingTiles = getSurroundingTiles({
    positionTile: obj.positionTile,
    size,
  });
  const { positionTile } = player;

  // check if player is at the destination
  if (
    surroundingTiles.some(
      ({ tileX, tileY }) =>
        tileX === positionTile.tileX && tileY === positionTile.tileY
    )
  ) {
    return {};
  }

  const destTile = availableTiles({ surroundingTiles, players, map }).reduce(
    (savedTile, tile) => {
      const distance = getChebyshevDistance(
        {
          tileX: positionTile.tileX,
          tileY: positionTile.tileY,
        },
        tile
      );

      return distance < savedTile.distance
        ? {
            ...tile,
            distance,
          }
        : savedTile;
    },
    { distance: Infinity }
  );

  return destTile.distance > 0 ? destTile : {};
};

export {
  getAllies,
  getChebyshevDistance,
  getDefenceSum,
  getDestTile,
  getDmg,
  getRandomInt,
  getRespawnTile,
  getXYFromTile,
};
