export default class UiPlayerList {
  constructor() {
    const [playerList] = document.getElementsByClassName(
      "player-list__content"
    );
    this.playerList = playerList;
    const [playerListCounter] = document.getElementsByClassName(
      "player-list__count"
    );
    this.playerListCounter = playerListCounter;
    this.playerCount = 0;
  }

  get count() {
    return this.playerCount;
  }

  increaseCount() {
    this.playerCount += 1;
    this.updateCount();
  }

  decreaseCount() {
    this.playerCount -= 1;
    this.updateCount();
  }

  updateCount() {
    this.playerListCounter.innerHTML = `(${this.playerCount})`;
  }

  rebuild(players) {
    this.clear();
    Object.keys(players).forEach((p) => {
      this.addPlayer(p);
    });
  }

  clear() {
    this.playerList.innerHTML = "";
    this.playerCount = 0;
    this.updateCount();
  }

  addPlayer(playerId) {
    const entry = document.createElement("li");
    entry.appendChild(document.createTextNode(playerId));
    entry.dataset.playerId = playerId;
    this.playerList.appendChild(entry);
    this.increaseCount();
  }

  removePlayer(playerId) {
    const playerEntry = document.querySelector(
      `[data-player-id="${playerId}"]`
    );
    playerEntry.remove();
    this.decreaseCount();
  }
}
