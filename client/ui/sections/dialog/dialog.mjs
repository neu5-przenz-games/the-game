import { gameItems } from "../../../../shared/init/gameItems/index.mjs";
import { ITEMS_PATH } from "../../constants.mjs";

const DIALOG_WRAPPER_CLASSNAME = "dialog-wrapper";
const DIALOG_CLASSNAME = "dialog";
const DIALOG_CLOSE_BUTTON_CLASSNAME = "dialog-header__close-button";
const DIALOG_CONTENT_CLASSNAME = "dialog-content";
const DIALOG_CONTENT_ITEM_CLASSNAME = `${DIALOG_CONTENT_CLASSNAME}__item`;
const DIALOG_CONTENT_ITEM_MARKER_CLASSNAME = `${DIALOG_CONTENT_CLASSNAME}__item-marker`;
const DIALOG_CONTENT_ITEM_QUANTITY_CLASSNAME = `${DIALOG_CONTENT_CLASSNAME}__item-quantity`;

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

    this.dialog.onclick = (ev) => {
      const { action } = ev.target.dataset;

      if (action === "GET_ITEMS") {
        const checkboxes = document.querySelectorAll(
          'input[name="looting-bag-item"]:checked'
        );

        const items = [];
        checkboxes.forEach((checkbox) => {
          items.push(checkbox.value);
        });

        dialogCb({ items, name });
      }
    };

    this.dialogCloseButton.onclick = () => {
      this.close();
    };
  }

  setContent(items) {
    this.dialogContent.textContent = "";

    const fragment = new DocumentFragment();

    for (let i = 0; i < items.length; i += 1) {
      const div = document.createElement("div");
      div.classList.add(DIALOG_CONTENT_ITEM_CLASSNAME);

      const item = items[i];

      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "looting-bag-item";
      checkbox.value = item.id;

      const marker = document.createElement("div");
      marker.classList.add(DIALOG_CONTENT_ITEM_MARKER_CLASSNAME);

      const itemImg = document.createElement("img");
      itemImg.src = ITEMS_PATH.concat(gameItems.get(item.id).imgURL);
      itemImg.dataset.itemName = item.id;

      const quantity = document.createElement("div");
      quantity.classList.add(DIALOG_CONTENT_ITEM_QUANTITY_CLASSNAME);
      quantity.innerText = item.quantity;

      div.appendChild(label);

      label.appendChild(checkbox);
      label.appendChild(marker);
      label.appendChild(itemImg);
      label.appendChild(quantity);

      fragment.appendChild(div);
    }

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
