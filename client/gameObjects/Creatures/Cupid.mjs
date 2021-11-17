import { Creature } from "./Creature.mjs";

class Cupid extends Creature {
  constructor(props) {
    super({
      ...props,
      spriteName: "mob-cupid",
    });
  }

  static TYPE = "Cupid";
}

export { Cupid };
