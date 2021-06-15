const getStartingTile = ({ tileX, tileY }) => ({ tileX, tileY });

const getStartingTileHouse = ({ tileX, tileY }) => ({
  tileX: tileX - 2,
  tileY,
});

const getStartingTileTree = getStartingTile;

module.exports = [
  {
    name: "house_dire",
    displayName: "Dire Sanctuary",
    type: "House",
    positionTile: { tileX: 14, tileY: 8 },
    startingTile: getStartingTileHouse,
    size: { tileX: 4, tileY: 3 },
  },
  {
    name: "house_radiant",
    displayName: "Radiant Sanctuary",
    type: "House",
    positionTile: { tileX: 15, tileY: 30 },
    startingTile: getStartingTileHouse,
    size: { tileX: 4, tileY: 3 },
  },
  {
    name: "tree1",
    displayName: "tree",
    type: "Tree",
    positionTile: { tileX: 17, tileY: 4 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "tree2",
    displayName: "tree",
    type: "Tree",
    positionTile: { tileX: 20, tileY: 20 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "ore-copper-1",
    displayName: "copper ore",
    type: "Ore",
    positionTile: { tileX: 20, tileY: 12 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
  {
    name: "ore-copper-2",
    displayName: "copper ore",
    type: "Ore",
    positionTile: { tileX: 16, tileY: 23 },
    startingTile: getStartingTileTree,
    size: { tileX: 1, tileY: 1 },
  },
].map((gameObject) => ({
  ...gameObject,
  startingTile: gameObject.startingTile(gameObject.positionTile),
}));
