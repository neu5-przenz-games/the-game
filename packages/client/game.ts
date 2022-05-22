import Phaser from "phaser";
import { MainScene } from "./scenes/mainScene.mjs";

const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const gameWidth = windowWidth > 1366 ? 1024 : windowWidth;
const gameHeight = windowWidth > 1366 ? 768 : windowHeight;

const [menu] = document.getElementsByClassName("menu");
const [mobileNavBtn] = document.getElementsByClassName("mobile-nav-button");

mobileNavBtn.addEventListener("click", () => {
  menu.classList.toggle("show");
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    width: gameWidth,
    height: gameHeight,
    parent: "the-game",
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [MainScene],
};

export const game = new Phaser.Game(config);