module.exports.command = function (
  { playerName, functionName, argsPassToClientFunc = [] },
  callback
) {
  const self = this;

  this.execute(
    (pn, fnName, args) => {
      return window.e2e[fnName](pn, args);
    },
    [playerName, functionName, ...argsPassToClientFunc],
    (result) => {
      if (typeof callback === "function") {
        callback.call(self, result);
      }
    }
  );

  return this;
};
