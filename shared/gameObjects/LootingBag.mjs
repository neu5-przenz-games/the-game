import { GameObject } from "./GameObject.mjs";

class LootingBag extends GameObject {
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

const getNewLootingBagItems = (itemsToAdd, lootingBagItems) => {
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

const mergeItems = (items, item) => {
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

const addLootingBagAfterPlayerIsDead = ({
  gameObjects,
  selectedObject,
  io,
}) => {
  if (selectedObject.hasItems()) {
    const lootingBag = gameObjects.find(
      (go) =>
        go.name ===
        `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`
    );

    if (lootingBag) {
      const currentItems = [...lootingBag.items];

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
          items: [
            ...currentItems,
            ...selectedObject.backpack.items,
            ...Object.values(selectedObject.equipment),
          ].reduce(mergeItems, []),
        })
      );
    } else {
      const items = [
        ...selectedObject.backpack.items,
        ...Object.values(selectedObject.equipment),
      ].reduce(mergeItems, []);

      selectedObject.setBackpack();
      selectedObject.setEquipment();

      gameObjects.push(
        new LootingBag({
          name: `LootingBag${selectedObject.positionTile.tileX}x${selectedObject.positionTile.tileY}`,
          positionTile: {
            tileX: selectedObject.positionTile.tileX,
            tileY: selectedObject.positionTile.tileY,
          },
          items,
        })
      );
    }

    const lootingBags = gameObjects.reduce((res, go) => {
      if (go.type === "LootingBag") {
        res.push(go);
      }

      return res;
    }, []);

    io.emit(
      "looting-bag:list",
      lootingBags.map(({ name, positionTile, items }) => ({
        id: name,
        positionTile,
        items,
      }))
    );
  }

  io.to(selectedObject.socketId).emit("player:dead", selectedObject.name);

  // clear player items if its dead
  io.to(selectedObject.socketId).emit(
    "items:update",
    selectedObject.backpack,
    selectedObject.equipment
  );
};

const removeItemsFromLootingBag = ({
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

export {
  LootingBag,
  addLootingBagAfterPlayerIsDead,
  getNewLootingBagItems,
  removeItemsFromLootingBag,
};
