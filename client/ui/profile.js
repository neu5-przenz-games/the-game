export default class UIProfile {
  constructor({ name }, respawnCb) {
    const [profileHello] = document.getElementsByClassName(
      "profile-wrapper__hello"
    );
    profileHello.innerHTML = `Hello, ${name}!`;

    const [respawnButton] = document.getElementsByClassName(
      "profile-wrapper__respawn-button"
    );

    this.respawnButton = respawnButton;

    this.respawnButton.onclick = () => {
      respawnCb(name);
    };
  }

  toggleRespawnButton(value) {
    this.respawnButton.disabled = !value;
  }
}
