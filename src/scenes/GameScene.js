import Phaser from "phaser";
import io from "socket.io-client";

import Skeleton from "../gameObjects/Skeleton";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";
import UIProfile from "../ui/profile";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.playersFromServer = [];
    this.players = [];
    this.playerList = new UIPlayerStatusList();
    this.socketId = null;
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
    this.buildMap();

    this.initSockets();

    this.initClicking();
  }

  buildMap() {
    this.tilemap = this.make.tilemap({ key: "map" });
    const tilesetOutside = this.tilemap.addTilesetImage(
      "outside",
      "tileset-outside"
    );

    this.groundLayer = this.tilemap.createLayer("Ground", tilesetOutside);
    this.tilemap.createLayer("Buildings", tilesetOutside);
    this.tilemap.createLayer("Above", tilesetOutside);

    this.socket = io();

    // this.cameras.main.setBounds(
    //   0,
    //   0,
    //   this.tilemap.widthInPixels,
    //   this.tilemap.heightInPixels
    // );
    // this.cameras.main.setPosition(0, 0);
  }

  initSockets() {
    this.socket.on("newPlayer", (newPlayer) => {
      this.displayServerMessage(`New player connected! ${newPlayer.id}`);
      this.playerList.playerActive(newPlayer.id);
    });

    this.socket.on("playerDisconnected", (id) => {
      this.displayServerMessage(`Player has left: ${id}`);
      this.playerList.playerInactive(id);
    });

    this.socket.on("currentPlayers", (players, socketId) => {
      this.socketId = socketId;
      this.playersFromServer = players;
      this.mainPlayerName = this.playersFromServer.find(
        (player) => player.socketId === this.socketId
      ).id;
      this.profile = new UIProfile(this.mainPlayerName);
      this.createPlayers();
      this.playerList.rebuild(players);
      this.displayServerMessage(
        `Current players: ${this.playerList.activeCount}`
      );
    });

    this.socket.on("playerMoving", () => {});
  }

  initClicking() {
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const { worldX, worldY } = pointer;

      this.mainPlayer.goTo(worldX, worldY);
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP);
    });
  }

  createPlayers() {
    this.players = this.playersFromServer.map((player) =>
      this.add.existing(
        new Skeleton({
          scene: this,
          x: player.x,
          y: player.y,
          isMainPlayer: player.socketId === this.socketId,
          motion: "idle",
          direction: player.direction,
        })
      )
    );

    this.mainPlayer = this.players.find((player) => player.isMainPlayer);

    this.cameras.main.startFollow(this.mainPlayer, true);
  }

  displayServerMessage(msgArg) {
    const posX = 30;
    const posY = 150;
    const msg = this.add.text(posX, posY, `server: ${msgArg}`, {
      font: "22px ",
      fill: "#ffde00",
      stroke: "#000",
      strokeThickness: 3,
    });
    msg.setOrigin(0.0, 0.0);
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: posY - 50,
      duration: 4000,
      ease: "Linear",
    });
  }

  emitPlayerMovement() {
    this.socket.emit("playerMovement", {
      id: this.mainPlayerName,
    });
  }

  update() {
    if (this.players.length) {
      this.players.forEach((player) => {
        player.update();
      });
    }
  }
}
