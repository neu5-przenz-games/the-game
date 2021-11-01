import { Mob } from "./Mob.mjs";

class Cupid extends Mob {
  constructor({ direction, isDead, name, displayName, scene, x, y }) {
    super({
      direction,
      isDead,
      name,
      displayName,
      scene,
      x,
      y,
      spriteName: "mob-cupid",
    });
  }

  static TYPE = "Cupid";
}

export { Cupid };
