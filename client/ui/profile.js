export default class UIProfile {
  constructor({
    name,
    weapon,
    settings,
    followCb,
    fightCb,
    showRangeCb,
    weaponCb,
    respawnCb,
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
    const [...weaponRadio] = document.getElementsByClassName(
      "equipement__weapon-radio"
    );

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRange = showRange;
    this.weaponRadio = weaponRadio;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRange.checked = settings.showRange;

    this.handleRadio = (ev) => {
      const { value } = ev.target;
      weaponCb(name, value);

      this.showRange.disabled = value === "sword";
    };

    this.weaponRadio.forEach((radio) => {
      if (radio.value === weapon) {
        radio.checked = true;
      }

      this.showRange.disabled = weapon === "sword";

      radio.onchange = this.handleRadio;
    });

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
  }

  toggleRespawnButton(value) {
    this.respawnButton.disabled = !value;
  }
}
