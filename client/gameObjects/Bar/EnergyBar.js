import Bar from "./Bar";
import COLOR from "../../constants";

export default class EnergyBar extends Bar {
  constructor(scene, x, y, xOffset, yOffset, value, drawBar = true) {
    super(scene, x, y, xOffset, yOffset, value, COLOR.ORANGE, drawBar);
  }
}
