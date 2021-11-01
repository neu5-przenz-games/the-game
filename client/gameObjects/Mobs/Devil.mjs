import { Mob } from "./Mob.mjs";

class Devil extends Mob {
  constructor({ direction, isDead, name, displayName, scene, x, y }) {
    super({
      direction,
      isDead,
      name,
      displayName,
      scene,
      x,
      y,
      spriteName: "mob-devil",
    });
  }

  static TYPE = "Devil";
}

export { Devil };
