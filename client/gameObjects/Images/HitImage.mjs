import { Image } from "./Image.mjs";

export class HitImage extends Image {
  constructor(props) {
    super({ ...props, imageId: "particle-red" });
  }
}
