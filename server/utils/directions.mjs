import { TILE, TILE_HALF, TILE_QUARTER } from "./constants.mjs";

const directions = {
  west: { x: -2, y: 0, opposite: "east", nextX: -TILE, nextY: 0 },
  northWest: {
    x: -2,
    y: -1,
    opposite: "southEast",
    nextX: -TILE_HALF,
    nextY: -TILE_QUARTER,
  },
  north: { x: 0, y: -2, opposite: "south", nextX: 0, nextY: -TILE_HALF },
  northEast: {
    x: 2,
    y: -1,
    opposite: "southWest",
    nextX: TILE_HALF,
    nextY: -TILE_QUARTER,
  },
  east: { x: 2, y: 0, opposite: "west", nextX: TILE, nextY: 0 },
  southEast: {
    x: 2,
    y: 1,
    opposite: "northWest",
    nextX: TILE_HALF,
    nextY: TILE_QUARTER,
  },
  south: { x: 0, y: 2, opposite: "north", nextX: 0, nextY: TILE_HALF },
  southWest: {
    x: -2,
    y: 1,
    opposite: "northEast",
    nextX: -TILE_HALF,
    nextY: TILE_QUARTER,
  },
};

const getDirection = (currentTile, nextTile) => {
  const angle =
    Math.atan2(
      nextTile.tileX - currentTile.tileX,
      nextTile.tileY - currentTile.tileY
    ) *
    (180 / Math.PI);

  let direction = null;

  if (angle > -157.5 && angle <= -112.5) {
    direction = "north";
  } else if (angle > -112.5 && angle <= -67.5) {
    direction = "northWest";
  } else if (angle > -67.5 && angle <= -22.5) {
    direction = "west";
  } else if (angle > -22.5 && angle <= 22.5) {
    direction = "southWest";
  } else if (angle > 22.5 && angle <= 67.5) {
    direction = "south";
  } else if (angle > 67.5 && angle <= 112.5) {
    direction = "southEast";
  } else if (angle > 112.5 && angle <= 157.5) {
    direction = "east";
  } else if (
    (angle > 157.5 && angle <= 180) ||
    (angle >= -180 && angle < -157.5)
  ) {
    direction = "northEast";
  }

  return direction;
};

const isObjectAhead = (player, selectedObject) =>
  ({
    north: ["north", "northEast", "northWest"],
    northWest: ["northWest", "north", "west"],
    west: ["west", "northWest", "southWest"],
    southWest: ["southWest", "west", "south"],
    south: ["south", "southWest", "southEast"],
    southEast: ["southEast", "south", "east"],
    east: ["east", "southEast", "northEast"],
    northEast: ["northEast", "east", "north"],
  }[getDirection(player.positionTile, selectedObject.positionTile)].includes(
    player.direction
  ));

export { directions, getDirection, isObjectAhead };
