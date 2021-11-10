import { Cupid } from "./Cupid.mjs";
import { Devil } from "./Devil.mjs";

const TYPES = {
  Cupid,
  Devil,
};

const createMob = (mob) => new TYPES[mob.type](mob);

export { createMob };
