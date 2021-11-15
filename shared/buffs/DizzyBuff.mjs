import { BUFF_EFFECT_TYPES, BUFF_TYPES, Buff } from "./Buff.mjs";

class DizzyBuff extends Buff {
  constructor({ selectedObjectName }) {
    super({
      name: "DizzyBuff",
      selectedObjectName,
      durationInMS: 2000,
      occurrencesIntervalInMS: 0,
      resultType: BUFF_TYPES.DIZZY,
      effect() {
        return {
          type: BUFF_EFFECT_TYPES.FIRE,
          value: 50,
        };
      },
    });
  }
}

export { DizzyBuff };
