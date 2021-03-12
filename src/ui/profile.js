export default class UIProfile {
  constructor(playerId) {
    const [profileHello] = document.getElementsByClassName(
      "profile-wrapper__hello"
    );
    profileHello.innerHTML = `Hello, ${playerId}!`;
  }
}
