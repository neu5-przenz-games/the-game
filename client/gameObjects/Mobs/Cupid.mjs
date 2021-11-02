import { Mob } from "./Mob.mjs";

class Cupid extends Mob {
  constructor(props) {
    super({
      ...props,
      spriteName: "mob-cupid",
    });
  }

  static TYPE = "Cupid";
}

export { Cupid };
