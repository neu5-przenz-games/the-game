module.exports.command = function ({
  browser,
  playerName,
  funcName,
  wantedValue,
  opts = {
    INTERVAL_IN_MS: 250,
    TIMEOUT_IN_MS: 5000,
  },
  callback,
}) {
  const self = this;

  const { INTERVAL_IN_MS, TIMEOUT_IN_MS } = opts;

  const startTime = new Date().getTime();

  const interval = setInterval(() => {
    const currTime = new Date().getTime();

    if (currTime - startTime > TIMEOUT_IN_MS) {
      clearInterval(interval);
      throw new Error("Timeout!");
    }

    self.playerFunction({ playerName, functionName: funcName }, (res) => {
      if (res.value === wantedValue) {
        callback({ browser, res, value: wantedValue });
        clearInterval(interval);
      }
    });
  }, INTERVAL_IN_MS);

  return this;
};
