import Phaser from "phaser";

import GameScene from "./scenes/GameScene";

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const gameWidth = windowWidth > 1366 ? 1024 : windowWidth;
const gameHeight = windowWidth > 1366 ? 768 : windowHeight;

const [settings] = document.getElementsByClassName("settings");
const [mobileNavBtn] = document.getElementsByClassName("mobile-nav-button");

mobileNavBtn.onclick = () => {
  settings.classList.toggle("show");
};

const config = {
  type: Phaser.AUTO,
  scale: {
    width: gameWidth,
    height: gameHeight,
    parent: "the-game",
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
