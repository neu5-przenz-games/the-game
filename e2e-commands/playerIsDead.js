module.exports.command = function (playerName, callback) {
  const self = this;

  this.execute(
    (pn) => {
      return window.e2e.player.isDead(pn);
    },
    [playerName],
    (result) => {
      if (typeof callback === "function") {
        callback.call(self, result);
      }
    }
  );

  return this;
};
