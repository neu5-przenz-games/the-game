import { GAME_ITEMS } from "../../../shared/index.mjs";
import { GFX_PATH } from "../constants.mjs";

export default class UIBackpack {
  constructor({ backpack }) {
    const [backpackSlots] = document.getElementsByClassName("backpack__slots");
    const [backpackItems] = document.getElementsByClassName("backpack__items");

    this.backpackSlots = backpackSlots;
    this.backpackItems = backpackItems;

    this.backpackSlots.innerText = `Backpack slots - ${backpack.slots}`;
  }

  setBackpack({ items, slots }) {
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
}
