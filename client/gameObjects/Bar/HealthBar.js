import Bar from "./Bar";
import COLOR from "../../constants";

export default class HealthBar extends Bar {
  constructor(scene, x, y, xOffset, yOffset, value, drawBar = true) {
    super(scene, x, y, xOffset, yOffset, value, COLOR.RED, drawBar);
  }
}
