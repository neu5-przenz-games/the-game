module.exports.command = function ({
  browser,
  playerName,
  funcName,
  wantedValue,
  callback,
  opts,
}) {
  const self = this;
  const INTERVAL_IN_MS = (opts && opts.INTERVAL_IN_MS) || 250;
  const TIMEOUT_IN_MS = (opts && opts.TIMEOUT_IN_MS) || 5000;

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
