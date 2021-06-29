module.exports.command = function (playerName) {
  const self = this;

  this.execute(
    (pn) => {
      return window.e2e.killPlayer(pn);
    },
    [playerName]
  );

  return this;
};
