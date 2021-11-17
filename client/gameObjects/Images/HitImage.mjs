import { Image } from "./Image.mjs";

const OFFSET_Y = 32;

export class HitImage extends Image {
  constructor({ y, ...props }) {
    super({ ...props, y: y + OFFSET_Y, imageId: "particle-red" });
  }
}
