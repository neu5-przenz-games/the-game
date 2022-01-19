import { UIPlayerList } from "./playerList.mjs";

export class UIPlayerStatusList {
  constructor() {
    this.activePlayerList = new UIPlayerList("player-list-active");
    this.inactivePlayerList = new UIPlayerList("player-list-inactive");
  }

  get activeCount() {
    return this.activePlayerList.count;
  }

  playerActive(playerId) {
    this.activePlayerList.addPlayer(playerId);
    this.inactivePlayerList.removePlayer(playerId);
  }

  playerInactive(playerId) {
    this.activePlayerList.removePlayer(playerId);
    this.inactivePlayerList.addPlayer(playerId);
  }

  rebuild(players) {
    this.clear();
    players.forEach((p) => {
      if (p.isOnline === true) {
        this.activePlayerList.addPlayer(p.name);
      } else {
        this.inactivePlayerList.addPlayer(p.name);
      }
    });
  }

  clear() {
    this.activePlayerList.clear();
    this.inactivePlayerList.clear();
  }
}
