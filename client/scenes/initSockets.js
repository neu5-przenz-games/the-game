import io from "socket.io-client";

import Skeleton from "../gameObjects/Skeleton";
import UIProfile from "../ui/profile";
import initEventsCapturing from "./initEventsCapturing";

const displayServerMessage = (game, msgArg) => {
  game.chat.addServerMessage(msgArg);
};

export default (game) => {
  game.setSocket(io());

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

  const weaponCb = (name, value) => {
    game.socket.emit("equipment:weapon", {
      name,
      value,
    });
    game.weapon = value;
  };

  const respawnCb = (name) => {
    game.socket.emit("respawnPlayer", {
      name,
    });
    game.profile.toggleRespawnButton(false);
  };

  game.socket.on("currentPlayers", (players, socketId) => {
    game.setSocketId(socketId);

    game.setMainPlayerName(
      players.find((player) => player.socketId === game.socketId).name
    );

    game.playerList.rebuild(players);

    game.setPlayers(
      players.map((player) => {
        let isMainPlayer = false;
        if (player.name === game.mainPlayerName) {
          isMainPlayer = true;

          game.setSettings(player.settings);
          game.setWeapon(player.equipment.weapon);
        }

        return game.add.existing(
          new Skeleton({
            direction: player.direction,
            isMainPlayer,
            hp: player.hp,
            isDead: player.isDead,
            motion: "idle",
            name: player.name,
            scene: game,
            x: player.x,
            y: player.y,
          })
        );
      })
    );

    game.players.forEach((player) => {
      player.setInteractive();
    });

    game.setMainPlayer(game.players.get(game.mainPlayerName));

    game.setProfile(
      new UIProfile({
        name: game.mainPlayerName,
        weapon: game.weapon,
        settings: game.settings,
        followCb,
        fightCb,
        weaponCb,
        respawnCb,
      })
    );

    game.cameras.main.startFollow(game.mainPlayer, true);

    initEventsCapturing(game);
  });

  game.socket.on("playersUpdate", (snapshot) => {
    game.SI.snapshot.add(snapshot);
  });

  game.socket.on("playerMessage", (message, playerName) => {
    game.chat.addMessage(playerName, message);
  });

  game.socket.on("connect", () => {
    displayServerMessage(game, `Connected to server`);
  });

  game.socket.on("disconnect", () => {
    // TODO(#86): properly handle disconnection from server
    displayServerMessage(game, `Disconnected from server`);
  });
};
