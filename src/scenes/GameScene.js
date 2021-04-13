import Phaser from "phaser";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import initMap from "./initMap";
import initSockets from "./initSockets";
import initClicking from "./initClicking";
import initChatInputCapture from "./initChatInputCapture";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";

import UIChat from "../ui/chat";

const FPS = 30;
const SI = new SnapshotInterpolation(FPS);

export default class Game extends Phaser.Scene {
  constructor() {
    super("GameScene");

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

    this.socket.on("snapshot", (snapshot) => {
      SI.snapshot.add(snapshot);
    });
  }

  update() {
    if (this.players.length) {
      this.players.forEach((player) => {
        player.update();
      });
    }
    // const snap = SI.calcInterpolation("x y");
    // if (!snap) return;
    // const { state } = snap;
    // if (!state) return;
    // state.forEach((player) => {
    // console.log(player);
    // const exists = this.dudes.has(dude.id)
    // if (!exists) {
    //   const _dude = this.add.sprite(dude.x, dude.y, 'dude')
    //   this.dudes.set(dude.id, { dude: _dude })
    // } else {
    //   const _dude = this.dudes.get(dude.id).dude
    //   _dude.setX(dude.x)
    //   _dude.setY(dude.y)
    // }
    // });
    // if (this.players.length) {
    //   this.players.forEach((player) => {
    //     player.update();
    //   });
    // }
  }
}
