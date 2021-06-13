const GFX_PATH = "/assets/gfx/";
const WEAPONS = {
  bow: "bow.png",
  sword: "sword.png",
};
const ITEMS = {
  wood: "wood.png",
  "copper ore": "copper-ore.png",
};

export default class UIProfile {
  constructor({
    name,
    isDead,
    weapon,
    backpack,
    settings,
    followCb,
    fightCb,
    showRangeCb,
    respawnCb,
    dropSelectionCb,
    actionCb,
  }) {
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

    const [equipmentWeapon] = document.getElementsByClassName(
      "equipement__weapon"
    );

    const [backpackSlots] = document.getElementsByClassName("backpack__slots");
    const [backpackItems] = document.getElementsByClassName("backpack__items");

    if (weapon) {
      const weaponImg = document.createElement("img");
      equipmentWeapon.innerText = "";
      weaponImg.src = GFX_PATH.concat(WEAPONS[weapon]);
      equipmentWeapon.appendChild(weaponImg);
    }

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRange = showRange;
    this.selectedName = selectedName;
    this.dropSelectionButton = dropSelectionButton;
    this.actionButton = actionButton;
    this.backpackSlots = backpackSlots;
    this.backpackItems = backpackItems;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRange.checked = settings.showRange;

    this.respawnButton.disabled = !isDead;

    this.backpackSlots.innerText = `Backpack slots - ${backpack.slots}`;
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
        itemImg.src = GFX_PATH.concat(ITEMS[item.name]);

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
}
