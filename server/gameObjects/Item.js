const ITEMS = {
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    durationTicks: 150,
    item: "wood",
  },
  Ore: {
    action: "mine",
    durationTicks: 300,
    item: "copper ore",
  },
};

const getAction = (go) => ITEMS[go.type].action;

const getDuration = (go) => ITEMS[go.type].durationTicks;

const getItem = (go) => ITEMS[go.type].item;

module.exports = {
  getAction,
  getDuration,
  getItem,
};
