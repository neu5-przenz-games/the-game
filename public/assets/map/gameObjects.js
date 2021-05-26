const getStartingTile = ({ x, y }) => ({ x, y });

const getStartingTileHouse = ({ x, y }) => ({ x: x - 2, y });

const getStartingTileTree = getStartingTile;

module.exports = [
  {
    name: "house1",
    type: "House",
    tile: { x: 14, y: 8 },
    startingTile: getStartingTileHouse,
    size: { x: 4, y: 3 },
  },
  {
    name: "house2",
    type: "House",
    tile: { x: 15, y: 30 },
    startingTile: getStartingTileHouse,
    size: { x: 4, y: 3 },
  },
  {
    name: "tree1",
    type: "Tree",
    tile: { x: 17, y: 4 },
    startingTile: getStartingTileTree,
    size: { x: 1, y: 1 },
  },
  {
    name: "tree2",
    type: "Tree",
    tile: { x: 20, y: 20 },
    startingTile: getStartingTileTree,
    size: { x: 1, y: 1 },
  },
  {
    name: "ore-copper-1",
    type: "Ore",
    tile: { x: 20, y: 12 },
    startingTile: getStartingTileTree,
    size: { x: 1, y: 1 },
  },
  {
    name: "ore-copper-2",
    type: "Ore",
    tile: { x: 16, y: 23 },
    startingTile: getStartingTileTree,
    size: { x: 1, y: 1 },
  },
].map((gameObject) => ({
  ...gameObject,
  startingTile: gameObject.startingTile(gameObject.tile),
}));
