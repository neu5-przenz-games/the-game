const TILE = 64;
const TILE_HALF = TILE / 2;
const TILE_QUARTER = TILE / 4;

const HIT_TYPES = {
  NORMAL: {
    color: "#FFE62B",
    text: "got hit",
  },
  HARD: {
    color: "#FF942B",
    text: "that's hard!",
  },
  CRITICAL: {
    color: "#FF0000",
    text: "ohh my!!!",
  },
};

export {
  HIT_TYPES,
  TILE,
  TILE_HALF,
  TILE_QUARTER,
};
