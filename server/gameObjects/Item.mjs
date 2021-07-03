const ITEMS = {
  House: {
    action: "rest",
  },
  Tree: {
    action: "chop",
    durationTicks: 150,
    item: {
      id: "wood",
      quantity: 1,
    },
  },
  Ore: {
    action: "mine",
    durationTicks: 300,
    item: {
      id: "copper ore",
      quantity: 1,
    },
  },
};

const getAction = (go) => ITEMS[go.type].action;

const getDuration = (go) => ITEMS[go.type].durationTicks;

const getItem = (go) => ITEMS[go.type].item;

export { getAction, getDuration, getItem };
