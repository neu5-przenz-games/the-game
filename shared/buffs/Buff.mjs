import { getDurationFromMSToTicks } from "../utils/index.mjs";

const BUFF_TYPES = {
  DIZZY: "DIZZY",
  HIT: "HIT",
};

const BUFF_EFFECT_TYPES = {
  FIRE: "FIRE",
};

class Buff {
  constructor({
    name,
    selectedObjectName,
    durationInMS,
    occurrencesIntervalInMS,
    resultType,
    effect,
  }) {
    this.name = name;
    this.selectedObjectName = selectedObjectName;
    this.resultType = resultType;

    this.durationTicks = {
      value: 0,
      maxValue: getDurationFromMSToTicks(durationInMS),
    };

    const intervalTicks = getDurationFromMSToTicks(occurrencesIntervalInMS);
    this.occurrencesIntervalTicks = {
      value: intervalTicks,
      maxValue: intervalTicks,
    };

    this.effect = effect;

    this.isFinished = false;
  }
}

export { BUFF_TYPES, BUFF_EFFECT_TYPES, Buff };
