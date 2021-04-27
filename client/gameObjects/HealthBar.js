import Phaser from "phaser";

const BLACK = 0x000000;
const RED = 0xff0000;
const WHITE = 0xffffff;

const BAR_WIDTH = 64;
const BAR_HEIGHT = 4;
const BAR_BORDER_WIDTH = 1;
const BAR_BORDER_WIDTH_DOUBLE = BAR_BORDER_WIDTH * 2;

const OFFSET = {
  X: -32,
  Y: -64,
};

export default class HealthBar {
  constructor(scene, x, y, value) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.x = x + OFFSET.X;
    this.y = y + OFFSET.Y;
    this.bar.depth = y;
    this.value = value;
    this.p = (BAR_WIDTH - BAR_BORDER_WIDTH_DOUBLE) / 100;

    this.draw();

    scene.add.existing(this.bar);
  }

  setPosition(x, y) {
    this.x = x + OFFSET.X;
    this.y = y + OFFSET.Y;
    this.bar.depth = y;

    this.draw();
  }

  updateValue(value) {
    this.value = value;
  }

  draw() {
    this.bar.clear();

    // border
    this.bar.fillStyle(BLACK);
    this.bar.fillRect(this.x, this.y, BAR_WIDTH, BAR_HEIGHT);

    // bar
    this.bar.fillStyle(WHITE);
    this.bar.fillRect(
      this.x + BAR_BORDER_WIDTH,
      this.y + BAR_BORDER_WIDTH,
      BAR_WIDTH - BAR_BORDER_WIDTH_DOUBLE,
      BAR_HEIGHT - BAR_BORDER_WIDTH_DOUBLE
    );

    // health
    this.bar.fillStyle(RED);
    this.bar.fillRect(
      this.x + BAR_BORDER_WIDTH,
      this.y + BAR_BORDER_WIDTH,
      Math.floor(this.p * this.value),
      BAR_HEIGHT - BAR_BORDER_WIDTH_DOUBLE
    );
  }
}
