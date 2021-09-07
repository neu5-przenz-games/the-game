import { TILE_HALF, TILE_QUARTER } from "./constants.mjs";
import { getSurroundingTiles } from "../../shared/utils/index.mjs";
import { gameItems } from "../../shared/init/gameItems/index.mjs";
import { LEVEL_TYPES } from "../../shared/skills/index.mjs";
import { ATTACK_TYPES } from "../../shared/attackTypes/index.mjs";

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

const getChebyshevDistance = (currTile, destTile) => {
  const distX = Math.abs(currTile.tileX - destTile.tileX);
  const distY = Math.abs(currTile.tileY - destTile.tileY);

  return Math.max(distX, distY);
};

const getDefenseSum = (eq) => {
  return Object.values(eq).reduce((defense, item) => {
    const itemSchema = gameItems.get(item.id);

    return itemSchema?.details?.defense
      ? defense + itemSchema.details.defense
      : defense;
  }, 0);
};

const isAttackMissed = ({
  currentWeapon,
  player,
  skillLevelName,
  selectedPlayer,
}) => {
  const SKILL_TO_MISS_PERC = {
    [LEVEL_TYPES.NOOB]: 150,
    [LEVEL_TYPES.BEGINNER]: 125,
    [LEVEL_TYPES.REGULAR]: 100,
    [LEVEL_TYPES.ADVANCED]: 75,
    [LEVEL_TYPES.EXPERT]: 50,
    [LEVEL_TYPES.MASTER]: 25,
  };

  let skillToMissPerc = SKILL_TO_MISS_PERC[skillLevelName];

  if (player.isWalking) {
    skillToMissPerc *= 2;
  }

  if (selectedPlayer.isWalking) {
    skillToMissPerc *= 2;
  }

  // ranged weapon
  if (currentWeapon.details.range > 1) {
    let range = getChebyshevDistance(
      player.positionTile,
      selectedPlayer.positionTile
    );

    range = range > 5 ? 5 : range;

    skillToMissPerc *= (100 + range * 10) / 100;
  }

  skillToMissPerc = Math.floor(skillToMissPerc);

  const random = getRandomInt(0, 1000);

  return random <= skillToMissPerc;
};

const getAttack = ({
  currentWeapon,
  player,
  skillLevelName,
  selectedPlayer,
}) => {
  if (
    isAttackMissed({ currentWeapon, player, skillLevelName, selectedPlayer })
  ) {
    return {
      type: ATTACK_TYPES.MISS,
    };
  }

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

  const skillToNum = SKILL_TO_NUM[skillLevelName];

  const diff = Math.floor((maxDmg - minDmg) / LVL_NUM);

  const dmgRangeStart = Math.floor(minDmg + diff * (skillToNum - 1));
  const dmgRangeEnd = dmgRangeStart + diff;

  return {
    type: ATTACK_TYPES.HIT,
    value: getRandomInt(dmgRangeStart, dmgRangeEnd),
  };
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
  getAttack,
  getChebyshevDistance,
  getDefenseSum,
  getDestTile,
  getRandomInt,
  getRespawnTile,
  getXYFromTile,
};
