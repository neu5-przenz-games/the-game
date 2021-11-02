import { TILE_HALF, TILE_QUARTER } from "./constants.mjs";
import { getSurroundingTiles } from "../../shared/utils/index.mjs";
import {
  gameItems,
  getCurrentWeapon,
} from "../../shared/init/gameItems/index.mjs";
import { LEVEL_TYPES, getLevel } from "../../shared/skills/index.mjs";
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

const getDefenseValue = (eq) => {
  return Object.values(eq).reduce((defense, item) => {
    const itemSchema = gameItems.get(item.id);

    return itemSchema?.details?.defense
      ? defense + itemSchema.details.defense
      : defense;
  }, 0);
};

const getHitValue = (attackValue, defenseValue) =>
  Math.floor(attackValue - (attackValue * defenseValue) / 1000);

const isAttackMissed = ({
  currentWeapon,
  player,
  skillLevelName,
  selectedObject,
}) => {
  const SKILL_TO_MISS_MAP = {
    [LEVEL_TYPES.NOOB]: 150,
    [LEVEL_TYPES.BEGINNER]: 125,
    [LEVEL_TYPES.REGULAR]: 100,
    [LEVEL_TYPES.ADVANCED]: 75,
    [LEVEL_TYPES.EXPERT]: 50,
    [LEVEL_TYPES.MASTER]: 25,
  };

  const MAX_RANGE = 5;

  let missChance = SKILL_TO_MISS_MAP[skillLevelName];

  if (player.isWalking) {
    missChance *= 2;
  }

  if (selectedObject.isWalking) {
    missChance *= 2;
  }

  // ranged weapon
  if (currentWeapon.details.range > 1) {
    let range = getChebyshevDistance(
      player.positionTile,
      selectedObject.positionTile
    );

    range = range > MAX_RANGE ? MAX_RANGE : range;

    missChance *= (100 + range * 10) / 100;
  }

  return getRandomInt(0, 1000) <= Math.floor(missChance);
};

const isAttackParried = ({ player, selectedObject }) => {
  if (
    selectedObject.selectedObject === null ||
    selectedObject.selectedObject.name !== player.name
  ) {
    return false;
  }

  const SKILL_TO_PARRY_MAP = {
    [LEVEL_TYPES.NOOB]: 0,
    [LEVEL_TYPES.BEGINNER]: 40,
    [LEVEL_TYPES.REGULAR]: 80,
    [LEVEL_TYPES.ADVANCED]: 120,
    [LEVEL_TYPES.EXPERT]: 160,
    [LEVEL_TYPES.MASTER]: 200,
  };

  let parryChance = 0;

  if (selectedObject.equipment.weapon) {
    const currentWeapon = getCurrentWeapon(selectedObject.equipment.weapon);
    const weaponSkill = currentWeapon.skillToIncrease.name;

    const weaponSkillLevelName = getLevel(
      selectedObject.skills[weaponSkill].points
    ).name;

    parryChance = SKILL_TO_PARRY_MAP[weaponSkillLevelName];
  }

  if (selectedObject.equipment.shield) {
    const currentShield = gameItems.get(selectedObject.equipment.shield.id);

    const weaponSkill = currentShield.skillToIncrease.name;

    const weaponSkillLevelName = getLevel(
      selectedObject.skills[weaponSkill].points
    ).name;

    parryChance += SKILL_TO_PARRY_MAP[weaponSkillLevelName];
  }

  return getRandomInt(0, 1000) <= Math.floor(parryChance);
};

const getAttack = ({
  currentWeapon,
  player,
  skillLevelName,
  selectedObject,
}) => {
  if (
    isAttackMissed({ currentWeapon, player, skillLevelName, selectedObject })
  ) {
    return {
      type: ATTACK_TYPES.MISS,
    };
  }

  if (isAttackParried({ player, selectedObject })) {
    return {
      type: ATTACK_TYPES.PARRY,
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

const getPatrollingIndex = (index, length) => (index < length ? index + 1 : 0);

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

const getRandomTile = ({ map, obj, players, sizeToIncrease }) => {
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
  getDefenseValue,
  getDestTile,
  getHitValue,
  getPatrollingIndex,
  getRandomInt,
  getRandomTile,
  getXYFromTile,
};
