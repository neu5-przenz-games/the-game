module.exports = [
  {
    name: "house1",
    type: "house",
    position: { x: 14, y: 8 },
    collides: {
      getStartingTile: (pos) => ({ x: pos.x - 2, y: pos.y }),
      size: { x: 4, y: 3 },
    },
  },
  {
    name: "house2",
    type: "house",
    position: { x: 15, y: 30 },
    collides: {
      getStartingTile: (pos) => ({ x: pos.x - 2, y: pos.y }),
      size: { x: 4, y: 3 },
    },
  },
];
