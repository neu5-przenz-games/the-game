import { Player } from "./Player.mjs";
import { Cupid } from "./mobs/Cupid.mjs";
import { Devil } from "./mobs/Devil.mjs";

const TYPES = {
  Cupid,
  Devil,
};

const createMob = (mob) => new TYPES[mob.type](mob);

export { Player, createMob };
