import { Image } from "./Image.mjs";

export class HealImage extends Image {
  constructor(props) {
    super({ ...props, imageId: "particle-healing-green" });
  }
}
