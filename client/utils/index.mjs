import { ParticleEmitter } from "./ParticleEmitter.mjs";
import { RangedParticleEmitter } from "./RangedParticleEmitter.mjs";

const createParticle = ({
  scene,
  image,
  x,
  y,
  depth,
  particleDuration,
  particleScale,
}) =>
  new ParticleEmitter({
    scene,
    particle: image,
    x,
    y,
    depth,
    particleDuration,
    particleScale,
  });

export { createParticle, RangedParticleEmitter };
