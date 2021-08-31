const playerName = "player1";

const verifyValue = ({ browser, res, value }) => {
  browser.assert.ok(res.value === value);
};

module.exports = {
  "player is alive": (browser) => {
    const game = browser.page.game();

    game
      .navigate()
      .waitForElementVisible("@menu")
      .click("@menu")
      .playerFunction({ playerName, functionName: "isPlayerDead" }, (res) => {
        browser.assert.ok(res.value === false);
      });
  },
  "player is getting killed": (browser) => {
    browser
      .playerFunction({ playerName, functionName: "killPlayer" })
      .waitUntil({
        browser,
        playerName,
        funcName: "isPlayerDead",
        wantedValue: true,
        callback: verifyValue,
      });
  },
  "player is respawned": (browser) => {
    const game = browser.page.game();
    let playerPositionTile = null;

    game
      .playerFunction(
        { playerName, functionName: "getPlayerCurrentPositionTile" },
        (res) => {
          playerPositionTile = res.value;
        }
      )
      .click("@btnRespawn")
      .waitUntil({
        browser,
        playerName,
        funcName: "isPlayerDead",
        wantedValue: false,
        callback: verifyValue,
      })
      .playerFunction(
        { playerName, functionName: "getPlayerCurrentPositionTile" },
        (res) => {
          browser.assert.ok(
            res.value.x !== playerPositionTile.x ||
              res.value.y !== playerPositionTile.y
          );
        }
      );
  },
  "player has no items": (browser) => {
    browser
      .playerFunction({ playerName, functionName: "clearPlayerItems" })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerBackpackItemsLength",
        wantedValue: 0,
        callback: verifyValue,
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerEquipmentItemsLength",
        wantedValue: 0,
        callback: verifyValue,
      });
  },
  "player have item set": (browser) => {
    browser
      .playerFunction({
        playerName,
        functionName: "setPlayerItems",
        argsPassToClientFunc: ["ARCHER_BASIC"],
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerBackpackItemsLength",
        wantedValue: 0,
        callback: verifyValue,
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerEquipmentItemsLength",
        wantedValue: 8,
        callback: verifyValue,
      });
  },
  "player can move quiver to the backpack": (browser) => {
    browser
      .playerFunction({
        playerName,
        functionName: "moveItemToBackpackFromEquipment",
        argsPassToClientFunc: ["quiver"],
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerBackpackItemsLength",
        wantedValue: 2,
        callback: verifyValue,
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerEquipmentItemsLength",
        wantedValue: 6,
        callback: verifyValue,
      });
  },
  "player can destroy arrows from the backpack": (browser) => {
    browser
      .playerFunction({
        playerName,
        functionName: "destroyItemFromBackpack",
        argsPassToClientFunc: ["arrowsBunch"],
      })
      .waitUntil({
        browser,
        playerName,
        funcName: "getPlayerBackpackItemsLength",
        wantedValue: 1,
        callback: verifyValue,
      })
      .end();
  },
};
