module.exports.command = function (
  playerName,
  funcName,
  predicate,
  callback,
  opts
) {
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

    self[funcName](playerName, (res) => {
      if (res.value === predicate) {
        callback(res);
        clearInterval(interval);
      }
    });
  }, INTERVAL_IN_MS);

  return this;
};