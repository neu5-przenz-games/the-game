import { LootingBag } from "../../../gameObjects/LootingBag.mjs";

export class UISettings {
  constructor({ checkboxCb, isDead, name, respawnCb, settings, game }) {
    const [respawnButton] = document.getElementsByClassName(
      "profile-wrapper__respawn-button"
    );
    const [followCheckbox] = document.getElementsByClassName(
      "profile-wrapper__follow-checkbox"
    );
    const [fightCheckbox] = document.getElementsByClassName(
      "profile-wrapper__fight-checkbox"
    );
    const [showRangeCheckbox] = document.getElementsByClassName(
      "profile-wrapper__range-checkbox"
    );
    const [keepSelectionOnMovementCheckbox] = document.getElementsByClassName(
      "profile-wrapper__keep-selection-on-movement-checkbox"
    );
    const [transparentObjectsCheckbox] = document.getElementsByClassName(
      "profile-wrapper__transparent-objects-checkbox"
    );

    this.respawnButton = respawnButton;
    this.followCheckbox = followCheckbox;
    this.fightCheckbox = fightCheckbox;
    this.showRangeCheckbox = showRangeCheckbox;
    this.keepSelectionOnMovementCheckbox = keepSelectionOnMovementCheckbox;
    this.transparentObjectsCheckbox = transparentObjectsCheckbox;

    this.followCheckbox.checked = settings.follow;
    this.fightCheckbox.checked = settings.fight;
    this.showRangeCheckbox.checked = settings.showRange;
    this.keepSelectionOnMovementCheckbox.checked =
      settings.keepSelectionOnMovement;
    this.transparentObjectsCheckbox.checked =
      settings.transparentObjectsCheckbox;

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
    this.showRangeCheckbox.onchange = handleCheckbox;
    this.keepSelectionOnMovementCheckbox.onchange = handleCheckbox;

    this.transparentObjectsCheckbox.onchange = () => {
      game.gameObjects.forEach((obj) => {
        if (obj.constructor.TYPE !== LootingBag.TYPE) {
          if (this.transparentObjectsCheckbox.checked) {
            obj.setAlpha(0.4);
            obj.disableInteractive();
          } else {
            obj.setAlpha(1);
            obj.setInteractive();
          }
        }
      });
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
