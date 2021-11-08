import { BUFF_EFFECT_TYPES, BUFF_TYPES, Buff } from "./Buff.mjs";

class SetOnFireBuff extends Buff {
  constructor({ selectedObjectName }) {
    super({
      name: "setOnFire",
      selectedObjectName,
      durationInMS: 6000,
      occurrencesIntervalInMS: 2000,
      resultType: BUFF_TYPES.HIT,
      effect() {
        return {
          type: BUFF_EFFECT_TYPES.FIRE,
          value: 50,
        };
      },
    });
  }
}

export { SetOnFireBuff };
