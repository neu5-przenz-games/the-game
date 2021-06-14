const ITEMS = {
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    duration: 150,
    item: "wood",
  },
  Ore: {
    action: "mine",
    duration: 300,
    item: "copper ore",
  },
};

const getAction = (go) => ITEMS[go.type].action;

const getDuration = (go) => ITEMS[go.type].duration;

const getItem = (go) => ITEMS[go.type].item;

module.exports = {
  getAction,
  getDuration,
  getItem,
};
