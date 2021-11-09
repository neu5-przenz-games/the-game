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

export const getNewLootingBagItems = (itemsToAdd, lootingBagItems) => {
  return lootingBagItems.reduce((lootingBag, item) => {
    const itemSelectedByPlayer = itemsToAdd.find(({ id }) => id === item.id);

    if (
      (itemSelectedByPlayer &&
        itemSelectedByPlayer.quantity !== item.quantity) ||
      itemSelectedByPlayer === undefined
    ) {
      lootingBag.push({
        ...item,
        quantity:
          item.quantity -
          (itemSelectedByPlayer ? itemSelectedByPlayer.quantity : 0),
      });
    }

    return lootingBag;
  }, []);
};

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

export const removeItemsFromLootingBag = ({
  gameObjects,
  newLootingBagItems,
  selectedObject,
}) => {
  if (newLootingBagItems.length === 0) {
    gameObjects.splice(
      gameObjects.findIndex(
        (go) =>
          go.name ===
          `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`
      ),
      1
    );
  } else {
    gameObjects.splice(
      gameObjects.findIndex(
        (go) =>
          go.name ===
          `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`
      ),
      1,
      new LootingBag({
        name: `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`,
        positionTile: {
          tileX: selectedObject.positionTile.tileX,
          tileY: selectedObject.positionTile.tileY,
        },
        items: [...newLootingBagItems],
      })
    );
  }
};
