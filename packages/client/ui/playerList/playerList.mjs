export class UIPlayerList {
  constructor(listClassPrefix) {
    const [playerList] = document.getElementsByClassName(
      `${listClassPrefix}__content`
    );
    this.playerList = playerList;
    const [playerListCounter] = document.getElementsByClassName(
      `${listClassPrefix}__count`
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
    const entry = this.playerList.querySelector(
      `[data-player-id="${playerId}"]`
    );
    entry.remove();
    this.decreaseCount();
  }
}
