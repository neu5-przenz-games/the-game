import Phaser from "phaser";
import GridMovementPlugin from "phaser-grid-movement-plugin";

import GameScene from "./scenes/GameScene";

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const gameWidth = windowWidth > 1366 ? 1024 : windowWidth;
const gameHeight = windowWidth > 1366 ? 768 : windowHeight;

const profileWrapper = document.getElementsByClassName("profile-wrapper")[0];
const mobileNavBtn = document.getElementsByClassName("mobile-nav-button")[0];

mobileNavBtn.onclick = () => {
  profileWrapper.classList.toggle("show");
};

const config = {
  type: Phaser.AUTO,
  scale: {
    width: gameWidth,
    height: gameHeight,
    parent: "the-game",
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
