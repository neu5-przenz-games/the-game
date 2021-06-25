import {
  GAME_ITEMS,
  ITEM_ACTIONS,
  ITEM_TYPES,
} from "../../../shared/index.mjs";
import { GFX_PATH } from "../constants.mjs";
import { createBtn } from "../utils/index.mjs";

const actionClassNames = [
  "equipment__actions-button",
  "equipment__action-button",
];

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

    this.equipmentElements = [
      "helmet",
      "weapon",
      "armor",
      "shield",
      "pants",
      "boots",
      "backpack",
    ];

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

    this.equipmentElements.forEach((name) => {
      const div = document.createElement("div");
      div.classList.add("equipment__item", `equipment__${name}`);

      const itemName = equipment[name];

      if (itemName) {
        const itemImg = document.createElement("img");
        itemImg.src = GFX_PATH.concat(GAME_ITEMS[itemName].imgURL);
        itemImg.dataset.itemName = itemName;
        itemImg.dataset.equipmentItemType = name;
        div.appendChild(itemImg);
      } else {
        div.innerText = name;
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
      } else if ([ITEM_TYPES.BACKPACK, ITEM_TYPES.WEAPON].includes(item.type)) {
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
