const getStartingTile = (pos) => ({ x: pos.x - 2, y: pos.y });

module.exports = [
  {
    name: "house1",
    type: "house",
    position: { x: 14, y: 8 },
    startingTile: getStartingTile,
    size: { x: 4, y: 3 },
  },
  {
    name: "house2",
    type: "house",
    position: { x: 15, y: 30 },
    startingTile: getStartingTile,
    size: { x: 4, y: 3 },
  },
].map((building) => ({
  ...building,
  startingTile: building.startingTile(building.position),
}));
