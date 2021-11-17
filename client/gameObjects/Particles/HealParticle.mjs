import { createParticle } from "../../utils/index.mjs";
import { HealImage } from "../Images/index.mjs";

export const HealParticle = (props) =>
  createParticle({
    ...props,
    image: new HealImage(props),
    particleScale: 0.3,
  });
