import Phaser from "phaser";

import initMap from "./initMap";
import initSockets from "./initSockets";
import initClicking from "./initClicking";
import initChatInputCapture from "./initChatInputCapture";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";

import UIChat from "../ui/chat";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.groundLayer = null;
    this.playersFromServer = [];
    this.players = [];
    this.playerList = new UIPlayerStatusList();
    this.profile = null;
    this.chat = new UIChat();
    this.socket = null;
    this.socketId = null;
  }

  setGroundLayer(groundLayer) {
    this.groundLayer = groundLayer;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  setSocketId(socketId) {
    this.socketId = socketId;
  }

  setPlayers(players) {
    this.players = players;
  }

  setPlayersFromServer(playersFromServer) {
    this.playersFromServer = playersFromServer;
  }

  setMainPlayer(mainPlayer) {
    this.mainPlayer = mainPlayer;
  }

  setMainPlayerName(mainPlayerName) {
    this.mainPlayerName = mainPlayerName;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  preload() {
    this.load.image("tileset-outside", "./assets/tileset/outside.png");
    this.load.tilemapTiledJSON("map", "./assets/map/map.json");
    this.load.spritesheet("skeleton", "./assets/character/skeleton.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    initMap(this);
    initSockets(this);
    initClicking(this);
    initChatInputCapture(this);
  }

  update() {
    if (this.players.length) {
      this.players.forEach((player) => {
        player.update();
      });
    }
  }
}
