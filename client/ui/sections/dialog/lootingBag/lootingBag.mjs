import { UIDialogWrapper } from "../wrapper/wrapper.mjs";
import { ITEMS_PATH } from "../../../constants.mjs";
import { createBtn } from "../../../utils/index.mjs";
import { gameItems } from "../../../../../shared/init/gameItems/index.mjs";

const DIALOG_ITEMS_COUNTER_CLASSNAME = "dialog-counter";
const DIALOG_ITEMS_CLASSNAME = "dialog-items";
const DIALOG_ITEM_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item`;
const DIALOG_LABEL_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__label`;
const DIALOG_ITEM_MARKER_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item-marker`;
const DIALOG_ITEM_QUANTITY_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item-quantity`;
const QUANTITY_SELECTOR_INPUT_CLASSNAME = "quantity-selector";

const ACTIONS = {
  CANCEL: "CANCEL",
  GET_ITEMS: "GET_ITEMS",
  SELECT_ALL: "SELECT_ALL",
  SELECT_CLEAR: "SELECT_CLEAR",
};

const getFooter = () => {
  const fragment = new DocumentFragment();

  const cancelBtn = createBtn({
    datasets: [{ name: "action", value: ACTIONS.CANCEL }],
    text: "Cancel",
  });

  const getItemsBtn = createBtn({
    datasets: [{ name: "action", value: ACTIONS.GET_ITEMS }],
    text: "Get items",
  });

  fragment.appendChild(cancelBtn);
  fragment.appendChild(getItemsBtn);

  return fragment;
};

export class UIDialogLootingBag extends UIDialogWrapper {
  constructor() {
    super();
    this.items = [];
    this.counter = null;
    this.checkboxes = [];
    this.quantitySelectors = [];
  }

  setListeners({ name, dialogCb }) {
    this.dialog.onclick = (ev) => {
      const { action } = ev.target.dataset;

      if (action === ACTIONS.GET_ITEMS) {
        const checkboxes = document.querySelectorAll(
          'input[name="looting-bag-item"]:checked'
        );

        const selectedItems = [];
        checkboxes.forEach((checkbox) => {
          selectedItems.push({
            id: checkbox.value,
            quantity: this.quantitySelectors.find(
              (input) => input.name === checkbox.value
            ).value,
          });
        });

        dialogCb({
          name,
          selectedItems,
          socketName: "looting-bag:get-items",
        });
      }

      if (action === ACTIONS.SELECT_ALL) {
        this.checkboxes.forEach((checkbox) => {
          checkbox.checked = true;
        });

        this.setCounter();
      }

      if (action === ACTIONS.SELECT_CLEAR) {
        this.checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });

        this.setCounter();
      }

      if (action === ACTIONS.CANCEL) {
        super.close();
      }

      if (
        ev.target.type === "checkbox" &&
        ev.target.name === "looting-bag-item"
      ) {
        this.setCounter();
      }
    };
  }

  setCounter() {
    this.counter.textContent = `Selected ${this.checkboxes.reduce(
      (sum, checkbox) => (checkbox.checked ? sum + 1 : sum),
      0
    )}/${this.items.length}`;
  }

  getContent(items) {
    this.items = items;
    this.checkboxes = [];
    this.quantitySelectors = [];

    const fragment = new DocumentFragment();

    const counter = document.createElement("p");
    counter.classList.add(DIALOG_ITEMS_COUNTER_CLASSNAME);

    this.counter = counter;
    this.setCounter();

    const selectAllBtn = createBtn({
      datasets: [{ name: "action", value: ACTIONS.SELECT_ALL }],
      text: "Select all",
    });

    const clearSelectedBtn = createBtn({
      datasets: [{ name: "action", value: ACTIONS.SELECT_CLEAR }],
      text: "Clear selection",
    });

    fragment.appendChild(counter);
    fragment.appendChild(selectAllBtn);
    fragment.appendChild(clearSelectedBtn);

    const itemsWrapper = document.createElement("div");
    itemsWrapper.classList.add(DIALOG_ITEMS_CLASSNAME);

    for (let i = 0; i < items.length; i += 1) {
      const div = document.createElement("div");
      div.classList.add(DIALOG_ITEM_CLASSNAME);

      const item = items[i];

      const label = document.createElement("label");
      label.classList.add(DIALOG_LABEL_CLASSNAME);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "looting-bag-item";
      checkbox.value = item.id;
      this.checkboxes.push(checkbox);

      const marker = document.createElement("div");
      marker.classList.add(DIALOG_ITEM_MARKER_CLASSNAME);

      const itemImg = document.createElement("img");
      itemImg.src = ITEMS_PATH.concat(gameItems.get(item.id).imgURL);
      itemImg.dataset.itemName = item.id;

      const quantity = document.createElement("div");
      quantity.classList.add(DIALOG_ITEM_QUANTITY_CLASSNAME);
      quantity.innerText = item.quantity;

      label.appendChild(checkbox);
      label.appendChild(marker);
      label.appendChild(itemImg);
      label.appendChild(quantity);

      div.appendChild(label);

      const quantitySelector = document.createElement("input");
      quantitySelector.classList.add(QUANTITY_SELECTOR_INPUT_CLASSNAME);
      quantitySelector.type = "number";
      quantitySelector.value = item.quantity;
      quantitySelector.min = 1;
      quantitySelector.max = item.quantity;
      quantitySelector.name = item.id;

      this.quantitySelectors.push(quantitySelector);

      div.appendChild(quantitySelector);

      itemsWrapper.appendChild(div);
    }

    fragment.appendChild(itemsWrapper);

    return fragment;
  }

  show({ name, items, dialogCb }) {
    this.setListeners({ name, dialogCb });

    const content = this.getContent(items);
    const footer = getFooter();

    super.show({
      content,
      footer,
    });
  }
}
