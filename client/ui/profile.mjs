import {
  UIBackpack,
  UICrafting,
  UIEquipment,
  UISettings,
  UISkills,
  UITabs,
} from "./sections/index.mjs";

export class UIProfile {
  constructor({
    name,
    isDead,
    equipment,
    crafting,
    skills,
    backpack,
    settings,
    followCb,
    fightCb,
    showRangeCb,
    respawnCb,
    dropSelectionCb,
    actionCb,
    itemActionsCb,
    craftingCb,
  }) {
    const [profileHello] = document.getElementsByClassName(
      "profile-wrapper__hello"
    );
    profileHello.innerHTML = `Hello, ${name}!`;

    const [selectedName] = document.getElementsByClassName("selected__name");
    const [dropSelectionButton] = document.getElementsByClassName(
      "selected__drop-button"
    );
    const [actionButton] = document.getElementsByClassName(
      "selected__action-button"
    );

    this.selectedName = selectedName;
    this.dropSelectionButton = dropSelectionButton;
    this.actionButton = actionButton;

    this.selectedItemName = null;

    this.UIEquipment = new UIEquipment({ name, itemActionsCb });
    this.UIBackpack = new UIBackpack();
    this.UICrafting = new UICrafting({ name, craftingCb });
    this.UISkills = new UISkills();
    this.UISettings = new UISettings({
      followCb,
      fightCb,
      isDead,
      name,
      respawnCb,
      settings,
      showRangeCb,
    });
    this.UITabs = new UITabs();

    this.UIEquipment.setEquipment(equipment);
    this.UIBackpack.setBackpack(backpack);
    this.UICrafting.setCrafting(crafting);
    this.UISkills.setSkills(skills);

    this.dropSelectionButton.onclick = () => {
      dropSelectionCb(name);
    };

    this.actionButton.onclick = () => {
      actionCb(name);
    };
  }

  setBackpack(backpack) {
    this.UIBackpack.setBackpack(backpack);
  }

  setSkills(skills) {
    this.UISkills.setSkills(skills);
  }

  setEquipment(equipment) {
    this.UIEquipment.setEquipment(equipment);
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
    this.UISettings.toggleRespawnButton(value);
  }
}
