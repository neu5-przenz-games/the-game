import Phaser from "phaser";
import io from "socket.io-client";

import UiPlayerList from "../ui/playerList";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.playerList = new UiPlayerList();
  }

  preload() {
    this.load.image("tileset", "./assets/tileset/tileset.png");
    this.load.tilemapTiledJSON("map", "./assets/map/map.json");

    this.load.spritesheet("characters", "./assets/character/characters.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
  }

  create() {
    this.tilemap = this.make.tilemap({ key: "map" });
    const tileset = this.tilemap.addTilesetImage("tileset", "tileset");

    const groundLayer = this.tilemap.createLayer("Ground", tileset);
    this.tilemap.createLayer("Collisions", tileset);
    this.tilemap.createLayer("Above", tileset);

    this.socket = io();
    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.players = [];

    this.cameras.main.setBounds(
      0,
      0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    );

    this.socket.on("newPlayer", (newPlayer) => {
      this.displayServerMessage(`New player connected! ${newPlayer.id}`);
    });
    this.socket.on("playerDisconnected", (id) => {
      // this.playerList.removePlayer(id);
      this.displayServerMessage(`Player has left: ${id}`);
      // delete this.players[id];
    });
    this.socket.on("currentPlayers", (players, socketId) => {
      this.players = players;
      this.mainPlayerName = this.players.find(
        (player) => player.socketId === socketId
      ).id;
      this.createPlayers(socketId);
      this.playerList.rebuild(players);
      this.displayServerMessage(`Current players: ${this.playerList.count}`);
    });
    this.socket.on("playerMoving", (player) => {
      this.gridMovementPlugin.moveTo(player.id, { x: player.x, y: player.y });
    });

    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
      const { worldX, worldY } = pointer;

      this.gridMovementPlugin.moveTo(
        this.mainPlayerName,
        groundLayer.worldToTileXY(worldX, worldY)
      );
    });

    // remember to clean up on Scene shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_UP);
    });
  }

  createPlayers(socketId) {
    this.mainPlayer = this.add.sprite(0, 0, "characters");

    const gridMovementConfig = {
      characters: this.players.map((player) => {
        return {
          id: player.id,
          sprite:
            player.socketId === socketId
              ? this.mainPlayer
              : this.add.sprite(0, 0, "characters"),
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
