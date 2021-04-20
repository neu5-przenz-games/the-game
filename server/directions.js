const TILE = 64;
const TILE_HALF = TILE / 2;
const TILE_QUARTER = TILE / 4;

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

const getDirection = (currentTile, nextTile) =>
  ({
    "1,0": "southEast",
    "1,1": "south",
    "0,1": "southWest",
    "-1,1": "west",
    "-1,0": "northWest",
    "-1,-1": "north",
    "0,-1": "northEast",
    "1,-1": "east",
  }[[nextTile.x - currentTile.x, nextTile.y - currentTile.y].join()]);

module.exports = {
  directions,
  getDirection,
};
