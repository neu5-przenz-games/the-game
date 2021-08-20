const MESSAGES_TYPES = {
  NO_ENERGY: "NO_ENERGY",
  NOT_IN_RANGE: "NOT_IN_RANGE",
  NO_RESOURCES: "NO_RESOURCES",
  NO_SKILL: "NO_SKILL",
};

const MESSAGES = {
  [MESSAGES_TYPES.NO_ENERGY]: "You are exhausted, rest for a while",
  [MESSAGES_TYPES.NOT_IN_RANGE]: "You are too far away, come closer",
  [MESSAGES_TYPES.NO_RESOURCES]: "Not enough resources",
  [MESSAGES_TYPES.NO_SKILL]: "You are not skilled enough",
};

export { MESSAGES, MESSAGES_TYPES };
