import { createParticle } from "../../utils/index.mjs";
import { HitImage } from "../Images/HitImage.mjs";

export const HitParticle = (props) =>
  createParticle({
    ...props,
    image: new HitImage(props),
    particleScale: 0.5,
  });
