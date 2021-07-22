const playerName = "player1";

module.exports = {
  "player is alive": (browser) => {
    const game = browser.page.game();

    game
      .navigate()
      .waitForElementVisible("@menu")
      .click("@menu")
      .isPlayerDead(playerName, (res) => {
        browser.assert.ok(res.value === false);
      });
  },
  "player is getting killed": (browser) => {
    const verifyIsPlayerDead = (res) => {
      browser.assert.ok(res.value === true);
    };

    browser
      .killPlayer(playerName)
      .waitUntil(playerName, "isPlayerDead", true, verifyIsPlayerDead);
  },
  "player is respawned": (browser) => {
    const game = browser.page.game();
    let playerPositionTile = null;

    const verifyIsPlayerAlive = (res) => {
      browser.assert.ok(res.value === false);
    };

    game
      .getPlayerPositionTile(playerName, (res) => {
        playerPositionTile = res.value;
      })
      .click("@btnRespawn")
      .waitUntil(playerName, "isPlayerDead", false, verifyIsPlayerAlive)
      .getPlayerPositionTile(playerName, (res) => {
        browser.assert.ok(
          res.value.x !== playerPositionTile.x ||
            res.value.y !== playerPositionTile.y
        );
      })
      .end();
  },
};
