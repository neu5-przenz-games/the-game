import { gameItems } from "../../../../shared/init/gameItems/index.mjs";
import { ITEMS_PATH } from "../../constants.mjs";

const DIALOG_WRAPPER_CLASSNAME = "dialog-wrapper";
const DIALOG_CLASSNAME = "dialog";
const DIALOG_CLOSE_BUTTON_CLASSNAME = "dialog-header__close-button";
const DIALOG_CONTENT_CLASSNAME = "dialog-content";

const DIALOG_ITEMS_COUNTER_CLASSNAME = "dialog-counter";
const DIALOG_ITEMS_CLASSNAME = "dialog-items";
const DIALOG_ITEM_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item`;
const DIALOG_LABEL_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__label`;
const DIALOG_ITEM_MARKER_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item-marker`;
const DIALOG_ITEM_QUANTITY_CLASSNAME = `${DIALOG_ITEMS_CLASSNAME}__item-quantity`;
const QUANTITY_SELECTOR_INPUT_CLASSNAME = "quantity-selector";

const DIALOG_FOOTER_CLASSNAME = "dialog-footer";

export class UIDialog {
  constructor({ dialogCb, name }) {
    const [dialogWrapper] = document.getElementsByClassName(
      DIALOG_WRAPPER_CLASSNAME
    );
    const [dialog] = document.getElementsByClassName(DIALOG_CLASSNAME);
    const [dialogCloseButton] = document.getElementsByClassName(
      DIALOG_CLOSE_BUTTON_CLASSNAME
    );
    const [dialogContent] = document.getElementsByClassName(
      DIALOG_CONTENT_CLASSNAME
    );
    const [dialogFooter] = document.getElementsByClassName(
      DIALOG_FOOTER_CLASSNAME
    );

    this.dialogWrapper = dialogWrapper;
    this.dialog = dialog;
    this.dialogCloseButton = dialogCloseButton;
    this.dialogContent = dialogContent;
    this.dialogFooter = dialogFooter;

    this.items = [];
    this.counter = null;
    this.checkboxes = [];
    this.quantitySelectors = [];

    this.dialog.onclick = (ev) => {
      const { action } = ev.target.dataset;

      if (action === "GET_ITEMS") {
        const checkboxes = document.querySelectorAll(
          'input[name="looting-bag-item"]:checked'
        );

        const items = [];
        checkboxes.forEach((checkbox) => {
          items.push({
            id: checkbox.value,
            quantity: this.quantitySelectors.find(
              (input) => input.name === checkbox.value
            ).value,
          });
        });

        dialogCb({ items, name });
      }

      if (action === "SELECT_ALL") {
        this.checkboxes.forEach((checkbox) => {
          checkbox.checked = true;
        });

        this.setCounter();
      }

      if (action === "SELECT_CLEAR") {
        this.checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });

        this.setCounter();
      }

      if (
        ev.target.type === "checkbox" &&
        ev.target.name === "looting-bag-item"
      ) {
        this.setCounter();
      }
    };

    this.dialogCloseButton.onclick = () => {
      this.close();
    };
  }

  setCounter() {
    this.counter.textContent = `Selected ${this.checkboxes.reduce(
      (sum, checkbox) => (checkbox.checked ? sum + 1 : sum),
      0
    )}/${this.items.length}`;
  }

  setContent(items) {
    this.dialogContent.textContent = "";

    this.items = items;
    this.checkboxes = [];
    this.quantitySelectors = [];

    const fragment = new DocumentFragment();

    const counter = document.createElement("p");
    counter.classList.add(DIALOG_ITEMS_COUNTER_CLASSNAME);

    this.counter = counter;
    this.setCounter();

    const selectAllBtn = document.createElement("button");
    selectAllBtn.textContent = "Select all";
    selectAllBtn.dataset.action = "SELECT_ALL";

    const clearSelectedBtn = document.createElement("button");
    clearSelectedBtn.textContent = "Clear selection";
    clearSelectedBtn.dataset.action = "SELECT_CLEAR";

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

    this.dialogContent.appendChild(fragment);
  }

  setFooter() {
    this.dialogFooter.textContent = "";

    const fragment = new DocumentFragment();

    const btn = document.createElement("button");
    btn.textContent = "Get items";
    btn.dataset.action = "GET_ITEMS";

    this.dialogFooter.appendChild(btn);

    this.dialogFooter.appendChild(fragment);
  }

  close() {
    this.dialogWrapper.classList.add("hidden");
  }

  show(items) {
    this.setContent(items);
    this.setFooter(items);

    this.dialogWrapper.classList.remove("hidden");
  }
}
