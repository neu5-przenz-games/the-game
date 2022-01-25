import {
  UIBackpack,
  UICrafting,
  UIDialog,
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
    actionCb,
    checkboxCb,
    craftingCb,
    dropSelectionCb,
    itemActionsCb,
    respawnCb,
    game,
  }) {
    const [profileHello] = document.getElementsByClassName(
      "profile-wrapper__hello"
    );
    profileHello.innerHTML = `Hello, ${name}!`;

    const [showMapButton] = document.getElementsByClassName(
      "profile-wrapper__show-map-button"
    );
    const [selectedName] = document.getElementsByClassName("selected__name");
    const [dropSelectionButton] = document.getElementsByClassName(
      "selected__drop-button"
    );
    const [actionButton] = document.getElementsByClassName(
      "selected__action-button"
    );

    this.showMapButton = showMapButton;
    this.selectedName = selectedName;
    this.dropSelectionButton = dropSelectionButton;
    this.actionButton = actionButton;

    this.selectedItemName = null;

    this.UIEquipment = new UIEquipment({ name, itemActionsCb });
    this.UIBackpack = new UIBackpack();
    this.UICrafting = new UICrafting({ name, craftingCb });
    this.UISkills = new UISkills();
    this.UISettings = new UISettings({
      checkboxCb,
      isDead,
      name,
      respawnCb,
      settings,
      game,
    });
    this.UITabs = new UITabs();

    this.UIEquipment.setEquipment(equipment);
    this.UIBackpack.setBackpack(backpack);
    this.UICrafting.setCrafting(crafting);
    this.UISkills.setSkills(skills);

    this.UIDialog = UIDialog;

    this.UIDialog.map.setGameType(game.mapType);
    this.showMapButton.onclick = () => {
      this.UIDialog.map.show(game.mainPlayer, game.mapImgDimensions);
    };

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
