import { Player } from "./Player.mjs";
import { Devil } from "./mobs/Devil.mjs";

const TYPES = {
  Devil,
};

const createMob = (mob) => new TYPES[mob.type](mob);

export { Player, createMob };
