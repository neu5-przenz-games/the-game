import { createParticle } from "../../utils/index.mjs";
import { FireImage } from "../Images/index.mjs";

export const FireParticle = ({ y, ...props }) => {
  const yWithOffset = y + 16;

  createParticle({
    ...props,
    y: yWithOffset,
    image: new FireImage({ ...props, y: yWithOffset }),
  });
};
