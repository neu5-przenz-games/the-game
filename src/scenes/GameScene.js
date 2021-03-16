import Phaser from "phaser";
import io from "socket.io-client";

import UIPlayerStatusList from "../ui/playerList/playerStatusList";
import UIProfile from "../ui/profile";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.players = [];
    this.playerList = new UIPlayerStatusList();
    this.socketId = null;
  }

  preload() {
    this.load.image("tiles", "./assets/stone_E.png");
    this.load.tilemapTiledJSON("map", "./assets/map/map.json");
    this.load.image("male", "./assets/character/male.png");
  }

  create() {
    this.buildMap();

    this.initSockets();

    this.initClicking();
  }

  buildMap() {
    this.tilemap = this.make.tilemap({ key: "map" });
    const tileset = this.tilemap.addTilesetImage("tileset", "tiles");

    this.groundLayer = this.tilemap.createLayer("Ground", tileset);
    // this.tilemap.createLayer("Collisions", tileset);
    // this.tilemap.createLayer("Above", tileset);

    this.socket = io();

    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    );
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
      this.players = players;
      this.mainPlayerName = this.players.find(
        (player) => player.socketId === this.socketId
      ).id;
      this.profile = new UIProfile(this.mainPlayerName);
      this.createPlayers();
      this.playerList.rebuild(players);
      this.displayServerMessage(
        `Current players: ${this.playerList.activeCount}`
      );
    });
    this.socket.on("playerMoving", (player) => {
      this.gridMovementPlugin.moveTo(player.id, { x: player.x, y: player.y });
    });
  }

  initClicking() {
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const { worldX, worldY } = pointer;
      this.gridMovementPlugin.moveTo(
        this.mainPlayerName,
        this.groundLayer.worldToTileXY(worldX, worldY)
      );
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP);
    });
  }

  createPlayers() {
    this.mainPlayer = this.add.sprite(0, 0, "male");

    const gridMovementConfig = {
      characters: this.players.map((player) => {
        return {
          id: player.id,
          sprite:
            player.socketId === this.socketId
              ? this.mainPlayer
              : this.add.sprite(0, 0, "male"),
          walkingAnimationMapping: player.walkingAnimationMapping,
          facingDirection: player.facingDirection,
          startPosition: new Phaser.Math.Vector2(player.x, player.y),
        };
      }),
    };

    this.cameras.main.startFollow(this.mainPlayer, true);
    this.gridMovementPlugin.create(this.tilemap, gridMovementConfig);
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
      facingDirection: this.gridMovementPlugin.getFacingDirection(
        this.mainPlayerName
      ),
      ...this.gridMovementPlugin.getPosition(this.mainPlayerName),
    });
  }

  update() {
    if (
      this.mainPlayerName &&
      this.gridMovementPlugin.isMoving(this.mainPlayerName)
    ) {
      this.emitPlayerMovement();
    }
  }
}
