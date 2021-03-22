import Phaser from "phaser";
import io from "socket.io-client";

import Skeleton from "../gameObjects/Skeleton";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";
import UIProfile from "../ui/profile";
import UIChat from "../ui/chat";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.playersFromServer = [];
    this.players = [];
    this.playerList = new UIPlayerStatusList();
    this.chat = new UIChat();
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

    this.initChatInputCapture();
  }

  buildMap() {
    this.tilemap = this.make.tilemap({ key: "map" });
    const tilesetOutside = this.tilemap.addTilesetImage(
      "outside",
      "tileset-outside"
    );

    this.groundLayer = this.tilemap.createLayer("Ground", tilesetOutside);
    this.tilemap.createLayer("OnGround", tilesetOutside);
    this.tilemap.createLayer("Collides", tilesetOutside);
    this.tilemap.createLayer("Above", tilesetOutside);
  }

  extractMapFromPhaserObject() {
    // TODO (#48): find better way to do that
    const myMap = this.tilemap.layers[2].data.map((arr) => {
      return arr.map((t) => {
        return t.index;
      });
    });
    console.log(myMap);
  }

  initSockets() {
    this.socket = io();

    this.socket.on("newPlayer", (newPlayer) => {
      this.displayServerMessage(`New player connected: ${newPlayer.name}`);
      this.playerList.playerActive(newPlayer.name);
    });

    this.socket.on("playerDisconnected", (name) => {
      this.displayServerMessage(`Player has left: ${name}`);
      this.playerList.playerInactive(name);
    });

    this.socket.on("currentPlayers", (players, socketId) => {
      this.socketId = socketId;
      this.playersFromServer = players;
      this.mainPlayerName = this.playersFromServer.find(
        (player) => player.socketId === this.socketId
      ).name;
      this.profile = new UIProfile(this.mainPlayerName);
      this.createPlayers();
      this.playerList.rebuild(players);
      this.displayServerMessage(
        `Current players: ${this.playerList.activeCount}`
      );
    });

    this.socket.on("playerMoving", (players) => {
      players.forEach((p) => {
        const player = this.players.find((pf) => pf.name === p.name);
        const dest = this.groundLayer.tileToWorldXY(p.x, p.y);
        player.x = dest.x;
        player.y = dest.y;
      });
    });

    this.socket.on("playerMessage", (message, playerName) => {
      this.chat.addMessage(playerName, message.text);
    });
  }

  initClicking() {
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const { worldX, worldY } = pointer;

      this.socket.emit("playerWishToGo", {
        name: this.mainPlayerName,
        ...this.groundLayer.worldToTileXY(worldX, worldY, true),
      });
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP);
    });
  }

  initChatInputCapture() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this.chat.message) {
        this.socket.emit("chatMessage", {
          text: this.chat.message,
        });
        this.chat.addOwnMessage();
        this.chat.clearInput();
      }
    });
  }

  createPlayers() {
    this.players = this.playersFromServer.map((player) =>
      this.add.existing(
        new Skeleton({
          direction: player.direction,
          isMainPlayer: player.socketId === this.socketId,
          motion: "idle",
          name: player.name,
          scene: this,
          ...this.groundLayer.tileToWorldXY(player.x, player.y),
        })
      )
    );

    this.mainPlayer = this.players.find((player) => player.isMainPlayer);

    this.cameras.main.startFollow(this.mainPlayer, true);
  }

  displayServerMessage(msgArg) {
    this.chat.addServerMessage(msgArg);
  }

  emitPlayerMovement() {
    this.socket.emit("playerMovement", {
      name: this.mainPlayerName,
      x: this.mainPlayer.x,
      y: this.mainPlayer.y,
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
