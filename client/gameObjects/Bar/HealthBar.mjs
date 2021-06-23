import Bar from "./Bar.mjs";
import COLOR from "../../constants/index.mjs";

export default class HealthBar extends Bar {
  constructor(scene, x, y, xOffset, yOffset, value, drawBar) {
    super(scene, x, y, xOffset, yOffset, value, COLOR.RED, drawBar);
  }
}
