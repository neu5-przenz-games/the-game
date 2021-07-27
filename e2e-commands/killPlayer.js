module.exports.command = function (playerName) {
  this.execute(
    (pn) => {
      return window.e2e.killPlayer(pn);
    },
    [playerName]
  );

  return this;
};
