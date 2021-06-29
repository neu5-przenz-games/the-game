const playerName = "player1";

module.exports = {
  "player is alive": (browser) => {
    const game = browser.page.game();

    game
      .navigate()
      .waitForElementVisible("@menu")
      .click("@menu")
      .playerIsDead(playerName, (res) => {
        browser.assert.ok(res.value === false);
      });
  },
  "player is getting killed": (browser) => {
    browser
      .killPlayer(playerName)
      .pause(2000)
      .playerIsDead(playerName, (res) => {
        browser.assert.ok(res.value === true);
      });
  },
  "player is respawned": (browser) => {
    const game = browser.page.game();
    let playerPositionTile = null;

    game
      .getPlayerPositionTile(playerName, (res) => {
        playerPositionTile = res.value;
      })
      .click("@btnRespawn")
      .pause(2000)
      .playerIsDead(playerName, (res) => {
        browser.assert.ok(res.value === false);
      })
      .getPlayerPositionTile(playerName, (res) => {
        browser.assert.ok(
          res.value.x !== playerPositionTile.x ||
            res.value.y !== playerPositionTile.y
        );
      })
      .end();
  },
};
