import {
  UIBackpack,
  UIEquipment,
  UISettings,
  UISkills,
  UITabs,
} from "./sections/index.mjs";

export default class UIProfile {
  constructor({
    name,
    isDead,
    equipment,
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
    this.UISkills = new UISkills();
    this.UIBackpack = new UIBackpack({ backpack });
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
    this.UISkills.setSkills(skills);
    this.UIBackpack.setBackpack(backpack);

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
