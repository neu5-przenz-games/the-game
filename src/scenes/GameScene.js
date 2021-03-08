import Phaser from "phaser";
import io from "socket.io-client";

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("tileset", "./assets/tileset/tileset.png");
    this.load.tilemapTiledJSON("map", "./assets/map/map.json");

    this.load.spritesheet("player", "./assets/character/characters.png", {
      frameWidth: 52,
      frameHeight: 72,
    });
  }

  create() {
    const tilemap = this.make.tilemap({ key: "map" });
    const tileset = tilemap.addTilesetImage("tileset", "tileset");

    tilemap.createLayer("Ground", tileset);
    tilemap.createLayer("Collisions", tileset);
    tilemap.createLayer("Above", tileset);

    const playerSprite = this.add.sprite(0, 0, "player");
    this.cameras.main.startFollow(playerSprite);

    const gridMovementConfig = {
      characters: [
        {
          id: "player",
          sprite: playerSprite,
          walkingAnimationMapping: 6,
          startPosition: new Phaser.Math.Vector2(8, 8),
        },
      ],
    };

    this.gridMovementPlugin.create(tilemap, gridMovementConfig);

    this.socket = io();
    this.stateStatus = null;
    this.playersNum = 0;
    this.players = {};

    this.socket.on("newPlayer", (player) => {
      const id = player.playerId;
      this.displayServerMessage(`New player connected! ${id}`);
      this.updatePlayers(this.playersNum + 1);
      this.players[id] = {
        playerId: id,
      };
    });
    this.socket.on("playerDisconnected", (id) => {
      this.displayServerMessage(`Player has left: ${id}`);
      this.updatePlayers(this.playersNum - 1);
      delete this.players[id];
    });
    this.socket.on("currentPlayers", (players) => {
      const playerNum = Object.keys(players).length;
      this.displayServerMessage(`Current players: ${playerNum}`);
      this.updatePlayers(playerNum);
      this.players = players;
    });

    this.cameras.main.fadeIn(250);
    this.stateStatus = "playing";
  }

  updatePlayers(n) {
    this.playersNum = n;
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

  update() {
    const cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
      this.gridMovementPlugin.moveLeft("player");
    } else if (cursors.right.isDown) {
      this.gridMovementPlugin.moveRight("player");
    } else if (cursors.up.isDown) {
      this.gridMovementPlugin.moveUp("player");
    } else if (cursors.down.isDown) {
      this.gridMovementPlugin.moveDown("player");
    }
  }
}