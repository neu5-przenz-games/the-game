import Phaser from "phaser";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import initMap from "../inits/map.mjs";
import initGameObjects from "../inits/gameObjects.mjs";
import sockets from "../events/sockets.mjs";

import UIPlayerStatusList from "../ui/playerList/playerStatusList.mjs";

import UIChat from "../ui/chat.mjs";

import DEBUG_MENU from "../ui/debugMenu.mjs";

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
    this.backpack = null;
    this.selectedObject = null;
    this.chat = new UIChat();
    this.socket = null;
    this.socketId = null;
    this.SI = new SnapshotInterpolation(FPS);

    // ui
    const [settings] = document.getElementsByClassName("settings");
    this.UIsettings = settings;

    if (process.env.NODE_ENV === "development") {
      DEBUG_MENU(this);
    }
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

  removePlayers() {
    this.players.forEach((player) => {
      player.destroy();
    });
    this.players.clear();
    this.playerList.clear();
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

  setEquipment(equipment) {
    this.equipment = equipment;
    this.profile.setEquipment(equipment);
  }

  setBackpack(backpack) {
    this.profile.setBackpack(backpack);
  }

  setSelectedObject(selectedObject) {
    this.selectedObject = selectedObject;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  resetSelectedObject() {
    this.selectedObject = null;
    this.profile.disableSelectionButton();
    this.profile.resetSelectedName();
    this.profile.resetActionButton();
  }

  preload() {
    this.load.image("tileset-outside", "./assets/tileset/outside.png");

    // objects
    this.load.image("House", "./assets/gfx/house.png");
    this.load.image("Tree", "./assets/gfx/tree.png");
    this.load.image("Ore", "./assets/gfx/ore-copper.png");

    this.load.image("tile-marked", "./assets/gfx/tile-marked.png");
    this.load.image("tile-selected", "./assets/gfx/tile-selected.png");
    this.load.image("tile-fight", "./assets/gfx/tile-fight.png");

    this.load.image("arrow-bow", "./assets/gfx/arrow-bow.png");

    this.load.tilemapTiledJSON("map", "./assets/map/map.json");
    this.load.spritesheet("skeleton", "./assets/character/skeleton.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  create() {
    initMap(this);
    initGameObjects(this);
    sockets(this);
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
