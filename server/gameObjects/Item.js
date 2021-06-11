const ITEMS = {
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    item: "wood",
  },
  Ore: {
    action: "mine",
    item: "copper ore",
  },
};

const getAction = (go) => ITEMS[go.type].action;

const getItem = (go) => ITEMS[go.type].item;

module.exports = {
  getAction,
  getItem,
};
