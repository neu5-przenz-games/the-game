import Phaser from "phaser";
import io from "socket.io-client";

import Skeleton from "../gameObjects/Skeleton.mjs";
import HitText from "../gameObjects/HitText.mjs";
import UIProfile from "../ui/profile.mjs";
import inputs from "./inputs.mjs";

const displayServerMessage = (game, msgArg) => {
  game.chat.addServerMessage(msgArg);
};

export default (game) => {
  game.setSocket(io());

  // @TODO: Refactor socket names #172
  game.socket.on("newPlayer", (newPlayer) => {
    displayServerMessage(game, `New player connected: ${newPlayer.name}`);
    game.playerList.playerActive(newPlayer.name);
  });

  game.socket.on("playerDisconnected", (name) => {
    displayServerMessage(game, `Player has left: ${name}`);
    game.playerList.playerInactive(name);
  });

  const followCb = (name, value) => {
    game.socket.emit("settings:follow", {
      name,
      value,
    });
    game.settings.follow = value;
  };

  const fightCb = (name, value) => {
    game.socket.emit("settings:fight", {
      name,
      value,
    });
    game.settings.fight = value;
  };

  const showRangeCb = (name, value) => {
    game.socket.emit("settings:showRange", {
      name,
      value,
    });
    game.settings.showRange = value;
  };

  const respawnCb = (name) => {
    game.socket.emit("respawnPlayer", {
      name,
    });
    game.profile.toggleRespawnButton(false);
  };

  const dropSelectionCb = (name) => {
    game.socket.emit("dropSelection", {
      name,
    });
    game.resetSelectedObject();
  };

  const actionCb = (name) => {
    game.socket.emit("action:button:clicked", {
      name,
    });
  };

  const itemActionsCb = ({ name, actionName, itemName, equipmentItemType }) => {
    game.socket.emit("action:item", {
      name,
      actionName,
      itemName,
      equipmentItemType,
    });
  };

  game.socket.on("players:list", (players, socketId) => {
    game.setSocketId(socketId);

    game.setMainPlayerName(
      players.find((player) => player.socketId === game.socketId).name
    );

    game.playerList.rebuild(players);

    let equipment = null;
    let backpack = null;

    game.setPlayers(
      players.map((player) => {
        let isMainPlayer = false;
        if (player.name === game.mainPlayerName) {
          isMainPlayer = true;

          game.setSettings(player.settings);

          equipment = player.equipment;
          backpack = player.backpack;
        }

        return game.add.existing(
          new Skeleton({
            direction: player.direction,
            isMainPlayer,
            hp: player.hp,
            energy: player.energy,
            isDead: player.isDead,
            name: player.name,
            displayName: player.displayName,
            fraction: player.fraction,
            scene: game,
            x: player.x,
            y: player.y,
          })
        );
      })
    );

    game.players.forEach((player) => {
      player.setInteractive(
        new Phaser.Geom.Rectangle(
          player.constructor.hitAreaSize.width / 2,
          player.constructor.hitAreaSize.height / 2,
          player.constructor.hitAreaSize.width,
          player.constructor.hitAreaSize.height
        ),
        Phaser.Geom.Rectangle.Contains
      );
    });

    const mainPlayer = game.players.get(game.mainPlayerName);
    game.setMainPlayer(mainPlayer);

    game.setProfile(
      new UIProfile({
        name: game.mainPlayerName,
        isDead: mainPlayer.isDead,
        equipment,
        settings: game.settings,
        backpack,
        followCb,
        fightCb,
        showRangeCb,
        respawnCb,
        dropSelectionCb,
        actionCb,
        itemActionsCb,
      })
    );

    game.cameras.main.startFollow(game.mainPlayer, true);

    inputs(game);
  });

  game.socket.on("players:update", (snapshot) => {
    game.SI.snapshot.add(snapshot);
  });

  game.socket.on("player:hit", ({ name, hitType }) => {
    const player = game.players.get(name);

    HitText({
      scene: game,
      x: player.x,
      y: player.y,
      depth: player.depth,
      hitType,
    });
  });

  game.socket.on("player:dead", (name) => {
    const player = game.players.get(name);

    if (player.isMainPlayer) {
      game.profile.toggleRespawnButton(true);
      game.mainPlayer.actionEnd();
      game.resetSelectedObject();
    }
    displayServerMessage(game, `You are dead ☠`);
  });

  game.socket.on("player:energy:update", (value) => {
    game.mainPlayer.energyBar.updateValue(value);
  });

  game.socket.on("action:button:set", ({ name }) => {
    if (name) {
      game.profile.setActionButton(name);
    } else {
      game.profile.resetActionButton();
    }
  });

  game.socket.on("action:start", (duration) => {
    game.mainPlayer.actionStart(duration);
  });

  game.socket.on("action:end", () => {
    game.mainPlayer.actionEnd();
  });

  game.socket.on("backpack:add", (backpack, equipment) => {
    if (backpack) {
      game.setBackpack(backpack);
    }
    if (equipment) {
      game.setEquipment(equipment);
    }
  });

  game.socket.on("playerMessage", (message, playerName) => {
    game.chat.addMessage(playerName, message);
  });

  game.socket.on("connect", () => {
    displayServerMessage(game, `Connected to server`);
  });

  game.socket.on("disconnect", () => {
    displayServerMessage(game, `Disconnected from server`);
    game.removePlayers();
  });
};
