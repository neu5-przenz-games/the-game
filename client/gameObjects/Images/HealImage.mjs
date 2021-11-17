import { Image } from "./Image.mjs";

const OFFSET_Y = 32;

export class HealImage extends Image {
  constructor({ y, ...props }) {
    super({ ...props, y: y + OFFSET_Y, imageId: "particle-healing-green" });
  }
}
