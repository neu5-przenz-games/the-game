import { Creature } from "./Creature.mjs";

class Devil extends Creature {
  constructor(props) {
    super({
      ...props,
      spriteName: "mob-devil",
    });
  }

  static TYPE = "Devil";
}

export { Devil };
