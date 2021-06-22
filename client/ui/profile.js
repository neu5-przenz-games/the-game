import { GAME_ITEMS, ITEM_ACTIONS, ITEM_TYPES } from "../../shared/index.mjs";
import { createBtn } from "./utils/index.mjs";

const GFX_PATH = "/assets/gfx/";

const actionClassNames = [
  "equipment__actions-button",
  "equipment__action-button",
];

export default class UIProfile {
  constructor({
    name,
    isDead,
    equipment,
    backpack,
    settings,
    followCb,
    fightCb,
    showRangeCb,
    respawnCb,
    dropSelectionCb,
    actionCb,
    itemActionsCb,
  }) {
    // @TODO: Refactor profile file to encapsulate different parts (settings, equipment, backpack) #173
    const [profileHello] = document.getElementsByClassName(
      "profile-wrapper__hello"
    );
    profileHello.innerHTML = `Hello, ${name}!`;

    const [respawnButton] = document.getElementsByClassName(
      "profile-wrapper__respawn-button"
    );
    const [followCheckbox] = document.getElementsByClassName(
      "profile-wrapper__follow-checkbox"
    );
    const [fightCheckbox] = document.getElementsByClassName(
      "profile-wrapper__fight-checkbox"
    );
    const [showRange] = document.getElementsByClassName(
      "profile-wrapper__range-checkbox"
    );
    const [selectedName] = document.getElementsByClassName("selected__name");
    const [dropSelectionButton] = document.getElementsByClassName(
      "selected__drop-button"
    );
    const [actionButton] = document.getElementsByClassName(
      "selected__action-button"
    );

    const [equipmentWrapper] = document.getElementsByClassName("equipment");
    const [equipmentItems] = document.getElementsByClassName(
      "equipment__personal"
    );

    const [equipmentItemActions] = document.getElementsByClassName(
      "equipment__actions"
    );

    this.equipmentElements = [
      "helmet",
      "weapon",
      "armor",
      "shield",
      "pants",
      "boots",
      "backpack",
    ];

    const [backpackSlots] = document.getElementsByClassName("backpack__slots");
    const [backpackItems] = document.getElementsByClassName("backpack__items");

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRange = showRange;
    this.selectedName = selectedName;
    this.dropSelectionButton = dropSelectionButton;
    this.actionButton = actionButton;
    this.backpackSlots = backpackSlots;
    this.backpackItems = backpackItems;

    this.equipmentWrapper = equipmentWrapper;
    this.equipmentItems = equipmentItems;
    this.equipmentItemActions = equipmentItemActions;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRange.checked = settings.showRange;

    this.respawnButton.disabled = !isDead;

    this.selectedItemName = null;
    this.equipmentItemType = null;

    this.backpackSlots.innerText = `Backpack slots - ${backpack.slots}`;

    this.setEquipment(equipment);
    this.setBackpack(backpack);

    this.followCheckbox.onchange = () => {
      followCb(name, this.followCheckbox.checked);
    };

    this.fightCheckbox.onchange = () => {
      fightCb(name, this.fightCheckbox.checked);
    };

    this.showRange.onchange = () => {
      showRangeCb(name, this.showRange.checked);
    };

    this.respawnButton.onclick = () => {
      respawnCb(name);
    };

    this.dropSelectionButton.onclick = () => {
      dropSelectionCb(name);
    };

    this.actionButton.onclick = () => {
      actionCb(name);
    };

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
          // @TODO: Implement item destroy action #170
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

  setBackpack({ slots, items }) {
    this.backpackItems.textContent = "";

    const fragment = new DocumentFragment();

    for (let i = 0; i < slots; i += 1) {
      const div = document.createElement("div");
      div.classList.add("backpack__item");

      if (items[i]) {
        const item = items[i];

        const itemImg = document.createElement("img");
        itemImg.src = GFX_PATH.concat(GAME_ITEMS[item.name].imgURL);
        itemImg.dataset.itemName = item.name;

        const quantity = document.createElement("div");
        quantity.classList.add("backpack__item-quantity");
        quantity.innerText = item.quantity;

        div.appendChild(itemImg);
        div.appendChild(quantity);
      } else {
        div.innerText = "empty";
      }

      fragment.appendChild(div);
    }

    this.backpackItems.appendChild(fragment);
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

  setSelectedName(name) {
    this.selectedName.innerText = name;
  }

  setActionButton(name) {
    this.actionButton.innerText = name;
    this.actionButton.classList.remove("hidden");
  }

  resetActionButton() {
    this.actionButton.innerText = "";
    this.actionButton.classList.add("hidden");
  }

  resetSelectedName() {
    this.selectedName.innerText = "";
  }

  enableSelectionButton() {
    this.dropSelectionButton.disabled = false;
  }

  disableSelectionButton() {
    this.dropSelectionButton.disabled = true;
  }

  toggleRespawnButton(value) {
    this.respawnButton.disabled = !value;
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
