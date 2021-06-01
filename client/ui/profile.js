const WEAPON_PATH = "/assets/gfx/";
const WEAPONS = {
  bow: "bow.png",
  sword: "sword.png",
};

export default class UIProfile {
  constructor({
    name,
    isDead,
    weapon,
    settings,
    followCb,
    fightCb,
    showRangeCb,
    respawnCb,
    dropSelectionCb,
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

    const [equipmentWeapon] = document.getElementsByClassName(
      "equipement__weapon"
    );

    if (weapon) {
      const weaponImg = document.createElement("img");
      equipmentWeapon.innerText = "";
      weaponImg.src = WEAPON_PATH.concat(WEAPONS[weapon]);
      equipmentWeapon.appendChild(weaponImg);
    }

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRange = showRange;
    this.selectedName = selectedName;
    this.dropSelectionButton = dropSelectionButton;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRange.checked = settings.showRange;

    this.respawnButton.disabled = !isDead;

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
  }

  setSelectedName(name) {
    this.selectedName.innerText = name;
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
