import { SKILLS_TYPES } from "../skills/index.mjs";

class Receipt {
  constructor({
    id,
    displayName,
    createdItem,
    quantity,
    energyCost,
    requiredItems,
    requiredSkills,
    requiredPlace,
    durationTicks,
    skill,
  }) {
    this.id = id;
    this.displayName = displayName;
    this.createdItem = createdItem;
    this.quantity = quantity;
    this.energyCost = energyCost;
    this.requiredItems = requiredItems;
    this.requiredSkills = requiredSkills;
    this.requiredPlace = requiredPlace;
    this.durationTicks = durationTicks;
    this.skill = skill;
  }
}

const arrowsReceipt = new Receipt({
  id: "arrows bunch receipt",
  displayName: "Arrows bunch",
  // get this from Item class
  createdItem: { id: "arrowsBunch", quantity: 10 },
  energyCost: 50,
  requiredItems: [
    // get this from Item class
    {
      id: "wood",
      quantity: 1,
    },
  ],
  requiredSkills: [
    {
      name: SKILLS_TYPES.WOODWORKING,
      points: 0,
    },
  ],
  durationTicks: 150,
  skill: {
    name: SKILLS_TYPES.WOODWORKING,
    pointsToGain: 5,
  },
});

const bowReceipt = new Receipt({
  id: "bow receipt",
  displayName: "Bow",
  // get this from Item class
  createdItem: { id: "bow", quantity: 1 },
  quantity: 1,
  energyCost: 50,
  requiredItems: [
    // get this from Item class
    {
      id: "wood",
      quantity: 2,
    },
  ],
  requiredSkills: [
    {
      name: SKILLS_TYPES.WOODWORKING,
      points: 10,
    },
  ],
  durationTicks: 300,
  skill: {
    name: SKILLS_TYPES.WOODWORKING,
    pointsToGain: 10,
  },
});

const receipts = new Map();
receipts.set(arrowsReceipt.id, arrowsReceipt);
receipts.set(bowReceipt.id, bowReceipt);

export default receipts;
