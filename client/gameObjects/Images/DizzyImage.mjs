import { Image } from "./Image.mjs";

const OFFSET_Y = -22;

export class DizzyImage extends Image {
  constructor({ y, ...props }) {
    super({ ...props, y: y + OFFSET_Y, imageId: "buff-dizzy" });
  }

  setPosition(x, y, depth) {
    this.image.x = x;
    this.image.y = y + OFFSET_Y;
    this.image.depth = depth + 8;
  }
}
