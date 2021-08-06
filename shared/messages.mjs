const MESSAGES = {
  no_energy: "You are exhausted, rest for a while",
  not_in_range: "You are too far away, come closer",
  no_resources: "Not enough resources",
  no_skill: "You are not skilled enough",
};

function getMsgKey(value) {
  return Object.keys(MESSAGES).find((key) => MESSAGES[key] === value);
}

export { MESSAGES, getMsgKey };
