export class UISettings {
  constructor({
    followCb,
    fightCb,
    isDead,
    keepSelectionOnMovementCb,
    name,
    respawnCb,
    settings,
    showRangeCb,
  }) {
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
    const [keepSelectionOnMovement] = document.getElementsByClassName(
      "profile-wrapper__keep-selection-on-movement-checkbox"
    );

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRange = showRange;
    this.keepSelectionOnMovement = keepSelectionOnMovement;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRange.checked = settings.showRange;
    this.keepSelectionOnMovement.checked = settings.keepSelectionOnMovement;

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

    this.keepSelectionOnMovement.onchange = () => {
      keepSelectionOnMovementCb(name, this.keepSelectionOnMovement.checked);
    };

    this.respawnButton.onclick = () => {
      respawnCb(name);
    };
  }

  setFollowCheckbox(value) {
    this.followCheckbox.checked = value;
  }

  toggleRespawnButton(value) {
    this.respawnButton.disabled = !value;
  }
}
