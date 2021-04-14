import io from "socket.io-client";

import UIProfile from "../ui/profile";
import initPlayers from "./initPlayers";

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

  game.socket.on("currentPlayers", (players, socketId) => {
    game.setSocketId(socketId);
    game.setPlayersFromServer(players);
    game.setMainPlayerName(
      game.playersFromServer.find((player) => player.socketId === game.socketId)
        .name
    );
    game.setProfile(new UIProfile(game.mainPlayerName));
    initPlayers(game);
    game.playerList.rebuild(players);
    displayServerMessage(
      game,
      `Current players: ${game.playerList.activeCount}`
    );
  });

  game.socket.on("playerMoving", (snapshot) => {
    game.SI.snapshot.add(snapshot);
  });

  game.socket.on("playerMessage", (message, playerName) => {
    game.chat.addMessage(playerName, message.text);
  });
};
