import { getDurationFromMSToTicks } from "../utils/index.mjs";

class Buff {
  constructor({
    name,
    selectedObjectName,
    durationInMS,
    occurrencesIntervalInMS,
    effect,
  }) {
    this.name = name;
    this.selectedObjectName = selectedObjectName;

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

export { Buff };
