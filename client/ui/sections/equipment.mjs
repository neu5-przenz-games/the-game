import {
  GAME_ITEMS,
  ITEM_ACTIONS,
  WEARABLE_TYPES,
} from "../../../shared/index.mjs";
import { ITEMS_PATH } from "../constants.mjs";
import { createBtn } from "../utils/index.mjs";

const actionClassNames = [
  "equipment__actions-button",
  "equipment__action-button",
];

const equipmentElements = WEARABLE_TYPES.map((type) => ({
  type,
  displayName: type,
}));

export default class UIEquipment {
  constructor({ name, itemActionsCb }) {
    const [equipmentWrapper] = document.getElementsByClassName("equipment");
    const [equipmentItems] = document.getElementsByClassName(
      "equipment__personal"
    );

    const [equipmentItemActions] = document.getElementsByClassName(
      "equipment__actions"
    );

    this.equipmentWrapper = equipmentWrapper;
    this.equipmentItems = equipmentItems;
    this.equipmentItemActions = equipmentItemActions;

    this.equipmentElements = equipmentElements;

    this.equipmentWrapper.onclick = (ev) => {
      const el = ev.target;
      const { itemName, equipmentItemType } = el.dataset;

      if (itemName) {
        this.selectedItemName = itemName;
        this.equipmentItemType = equipmentItemType;
        this.showItemActions(Boolean(equipmentItemType));
      }
    };

    this.equipmentItemActions.onclick = (ev) => {
      const { actionName } = ev.target.dataset;

      if (!actionName) {
        return;
      }

      ({
        [ITEM_ACTIONS.CLOSE]: () => {
          // do nothing
        },
        [ITEM_ACTIONS.DESTROY]: () => {
          itemActionsCb({
            name,
            actionName,
            itemName: this.selectedItemName,
            equipmentItemType: this.equipmentItemType,
          });
        },
        [ITEM_ACTIONS.MOVE_TO_BACKPACK]: () => {
          itemActionsCb({
            name,
            actionName,
            itemName: this.selectedItemName,
            equipmentItemType: this.equipmentItemType,
          });
        },
        [ITEM_ACTIONS.MOVE_TO_EQUIPMENT]: () => {
          itemActionsCb({
            name,
            actionName,
            itemName: this.selectedItemName,
          });
        },
      }[actionName]());

      this.hideItemActions();
    };
  }

  setEquipment(equipment) {
    this.equipmentItems.textContent = "";

    const fragment = new DocumentFragment();

    this.equipmentElements.forEach(({ type, displayName }) => {
      const div = document.createElement("div");
      div.classList.add("equipment__item", `equipment__${type}`);

      const item = equipment[type];

      if (item) {
        const itemImg = document.createElement("img");
        itemImg.src = ITEMS_PATH.concat(GAME_ITEMS[item.id].imgURL);
        itemImg.dataset.itemName = item.id;
        itemImg.dataset.equipmentItemType = type;

        if (type === WEARABLE_TYPES.ARROWS) {
          const quantity = document.createElement("div");
          quantity.classList.add("equipment__item-quantity");
          quantity.innerText = item.quantity;
          div.appendChild(quantity);
        }

        div.appendChild(itemImg);
      } else {
        div.innerText = displayName;
      }

      fragment.appendChild(div);
    });

    this.equipmentItems.appendChild(fragment);
  }

  setItemActionMenu(isInEquipment) {
    this.equipmentItemActions.textContent = "";

    const fragment = new DocumentFragment();

    const itemNameSpan = document.createElement("span");
    itemNameSpan.classList.add("equipment__item-name");
    itemNameSpan.innerText = this.selectedItemName;
    fragment.appendChild(itemNameSpan);

    const btnClose = createBtn({
      classNames: actionClassNames,
      datasets: [{ name: "actionName", value: ITEM_ACTIONS.CLOSE }],
      text: "close",
    });
    fragment.appendChild(btnClose);

    const item = GAME_ITEMS[this.selectedItemName];
    if (item) {
      if (isInEquipment) {
        const btnMoveToBackpack = createBtn({
          classNames: actionClassNames,
          datasets: [
            { name: "actionName", value: ITEM_ACTIONS.MOVE_TO_BACKPACK },
          ],
          text: "move to backpack",
        });
        fragment.appendChild(btnMoveToBackpack);
      } else if (WEARABLE_TYPES.includes(item.type)) {
        const btnWearIt = createBtn({
          classNames: actionClassNames,
          datasets: [
            { name: "actionName", value: ITEM_ACTIONS.MOVE_TO_EQUIPMENT },
          ],
          text: "wear it",
        });
        fragment.appendChild(btnWearIt);
      }
    }

    const btnDestroy = createBtn({
      classNames: actionClassNames,
      datasets: [{ name: "actionName", value: ITEM_ACTIONS.DESTROY }],
      text: "destroy",
    });
    fragment.appendChild(btnDestroy);

    this.equipmentItemActions.appendChild(fragment);
  }

  showItemActions(isInEquipment) {
    this.setItemActionMenu(isInEquipment);
    this.equipmentItemActions.classList.remove("hidden");
  }

  hideItemActions() {
    this.selectedItemName = null;
    this.equipmentItemType = null;
    this.equipmentItemActions.classList.add("hidden");
  }
}
