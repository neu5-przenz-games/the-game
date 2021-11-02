import { Mob } from "./Mob.mjs";

class Devil extends Mob {
  constructor(props) {
    super({
      ...props,
      spriteName: "mob-devil",
    });
  }

  static TYPE = "Devil";
}

export { Devil };
