export class UISettings {
  constructor({ checkboxCb, isDead, name, respawnCb, settings }) {
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

    const handleCheckbox = (ev) => {
      const { dataset, checked } = ev.target;

      checkboxCb({
        checkboxName: dataset.name,
        name,
        value: checked,
      });
    };

    this.followCheckbox.onchange = handleCheckbox;
    this.fightCheckbox.onchange = handleCheckbox;
    this.showRange.onchange = handleCheckbox;
    this.keepSelectionOnMovement.onchange = handleCheckbox;

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
