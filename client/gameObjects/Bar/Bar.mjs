import Phaser from "phaser";
import { COLOR } from "../../constants/index.mjs";

const BAR_WIDTH = 64;
const BAR_HEIGHT = 4;
const BAR_BORDER_WIDTH = 1;
const BAR_BORDER_WIDTH_DOUBLE = BAR_BORDER_WIDTH * 2;

export default class Bar {
  constructor(scene, x, y, xOffset, yOffset, value, color, drawBar = true) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.offsetX = xOffset;
    this.offsetY = yOffset;
    this.x = x + this.offsetX;
    this.y = y + this.offsetY;
    this.bar.depth = y;
    this.value = value;
    this.p = (BAR_WIDTH - BAR_BORDER_WIDTH_DOUBLE) / 100;
    this.valueColor = color;
    this.drawBar = drawBar;

    if (this.drawBar) {
      this.draw();
    }

    scene.add.existing(this.bar);
  }

  setPosition(x, y, depth) {
    this.x = x + this.offsetX;
    this.y = y + this.offsetY;
    this.bar.depth = depth;

    if (this.drawBar) {
      this.draw();
    }
  }

  updateValue(value) {
    this.value = value;
  }

  hide() {
    this.drawBar = false;
    this.bar.clear();
  }

  show() {
    this.drawBar = true;
  }

  draw() {
    this.bar.clear();

    // border
    this.bar.fillStyle(COLOR.BLACK);
    this.bar.fillRect(this.x, this.y, BAR_WIDTH, BAR_HEIGHT);

    // bar
    this.bar.fillStyle(COLOR.WHITE);
    this.bar.fillRect(
      this.x + BAR_BORDER_WIDTH,
      this.y + BAR_BORDER_WIDTH,
      BAR_WIDTH - BAR_BORDER_WIDTH_DOUBLE,
      BAR_HEIGHT - BAR_BORDER_WIDTH_DOUBLE
    );

    // value
    this.bar.fillStyle(this.valueColor);
    this.bar.fillRect(
      this.x + BAR_BORDER_WIDTH,
      this.y + BAR_BORDER_WIDTH,
      Math.floor(this.p * this.value),
      BAR_HEIGHT - BAR_BORDER_WIDTH_DOUBLE
    );
  }

  destroy() {
    this.bar.destroy();
  }
}
