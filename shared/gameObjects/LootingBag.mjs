import { GameObject } from "./GameObject.mjs";

export class LootingBag extends GameObject {
  constructor({
    name,
    displayName = "Looting Bag",
    type = "LootingBag",
    positionTile,
    size = { x: 1, y: 1 },
    items = [],
  }) {
    super({ name, displayName, type, positionTile, size });

    this.items = items;
  }
}

export const mergeItems = (items, item) => {
  const index = items.findIndex((i) => i.id === item.id);

  if (index !== -1) {
    const itemToAdd = items[index];

    items[index] = {
      ...itemToAdd,
      quantity: itemToAdd.quantity + item.quantity,
    };
  } else {
    items.push(item);
  }

  return items;
};
