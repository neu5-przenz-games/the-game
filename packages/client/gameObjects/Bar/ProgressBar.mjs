import { Bar } from "./Bar.mjs";
import { BAR_MAX_VALUE, COLOR } from "../../constants/index.mjs";

export class ProgressBar extends Bar {
  constructor(scene, x, y, xOffset, yOffset, value, drawBar) {
    super(scene, x, y, xOffset, yOffset, value, COLOR.GREEN, drawBar);

    this.scene = scene;
    this.counter = null;
  }

  startCounter(duration, from = 0, to = BAR_MAX_VALUE) {
    this.updateValue(from);
    this.show();

    this.counter = this.scene.tweens.addCounter({
      from,
      to,
      duration,
    });
  }

  update() {
    if (this.counter !== null) {
      this.updateValue(this.counter.getValue());
    }
  }

  resetCounter() {
    this.hide();

    this.counter = null;
  }
}
