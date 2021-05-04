import Phaser from "phaser";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import initMap from "./initMap";
import initSockets from "./initSockets";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";

import UIChat from "../ui/chat";

const FPS = 30;

export default class Game extends Phaser.Scene {
  constructor() {
    super("GameScene");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.groundLayer = null;
    this.players = new Map();
    this.playerList = new UIPlayerStatusList();
    this.profile = null;
    this.settings = null;
    this.selectedObject = null;
    this.chat = new UIChat();
    this.socket = null;
    this.socketId = null;
    this.SI = new SnapshotInterpolation(FPS);
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
    players.forEach((player) => {
      this.players.set(player.name, player);
    });
  }

  setMainPlayer(mainPlayer) {
    this.mainPlayer = mainPlayer;
  }

  setMainPlayerName(mainPlayerName) {
    this.mainPlayerName = mainPlayerName;
  }

  setSettings(settings) {
    this.settings = settings;
  }

  setWeapon(weapon) {
    this.weapon = weapon;
  }

  setSelectedObject(selectedObject) {
    this.selectedObject = selectedObject;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  resetSelectedObject() {
    this.selectedObject = null;
  }

  preload() {
    this.load.image("tileset-outside", "./assets/tileset/outside.png");

    this.load.image("tile-selected", "./assets/gfx/tile-selected.png");
    this.load.image("tile-fight", "./assets/gfx/tile-fight.png");

    this.load.tilemapTiledJSON("map", "./assets/map/map.json");
    this.load.spritesheet("skeleton", "./assets/character/skeleton.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    initMap(this);
    initSockets(this);
  }

  update() {
    if (this.players.size) {
      const snap = this.SI.calcInterpolation("x y");
      if (!snap) return;

      const { state } = snap;
      if (!state) return;

      state.forEach((player) => {
        const playerToUpdate = this.players.get(player.id);
        playerToUpdate.update(player);
      });
    }
  }
}
