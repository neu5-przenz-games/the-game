import { BUFF_TYPES, Buff } from "./Buff.mjs";

class DizzyBuff extends Buff {
  constructor({ selectedObjectName }) {
    super({
      name: "DizzyBuff",
      selectedObjectName,
      durationInMS: 2000,
      occurrencesIntervalInMS: 0,
      resultType: BUFF_TYPES.DIZZY,
    });
  }
}

export { DizzyBuff };
