import Phaser from "phaser";
import GridMovementPlugin from "phaser-grid-movement-plugin";

import GameScene from "./scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  scale: {
    width: 1024,
    height: 768,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: "gridMovementPlugin",
        plugin: GridMovementPlugin,
        mapping: "gridMovementPlugin",
      },
    ],
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: 0,
    },
  },
  scene: [GameScene],
};

export default new Phaser.Game(config);
