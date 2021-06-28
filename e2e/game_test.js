module.exports = {
  "player is alive": (browser) => {
    let playerName = null;

    browser
      .url("http://localhost:5000")
      .waitForElementVisible(".menu")
      .click(".menu")
      .getText(".profile-wrapper__hello", (result) => {
        playerName = result.value.split(" ")[1].slice(0, -1);
      })
      .execute(
        (pn) => {
          return window.e2e.player.isDead(pn);
        },
        ["player1"],
        (res) => {
          browser.assert.ok(res.value === false);
        }
      );
  },
  "player is getting killed": (browser) => {
    browser
      .execute(
        (pn) => {
          return window.e2e.killPlayer(pn);
        },
        ["player1"]
      )
      .pause(2000) // wait 2s for game to calculate
      .execute(
        (pn) => {
          return window.e2e.player.isDead(pn);
        },
        ["player1"],
        (res) => {
          browser.assert.ok(res.value === true);
        }
      );
  },
  "player is respawned": (browser) => {
    browser
      .click(".profile-wrapper__respawn-button")
      .pause(2000) // wait 2s for game to calculate
      .execute(
        (pn) => {
          return window.e2e.player.isDead(pn);
        },
        ["player1"],
        (res) => {
          browser.assert.ok(res.value === false);
        }
      )
      .end();
  },
};
