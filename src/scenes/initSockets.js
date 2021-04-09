import io from "socket.io-client";
import UIProfile from "../ui/profile";
import { OFFSET, directions } from "../gameObjects/Skeleton";
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

  game.socket.on("playerMoving", (players) => {
    players.forEach((p) => {
      const player = game.players.find((pf) => pf.name === p.name);

      const { x, y } = game.groundLayer.tileToWorldXY(p.x, p.y);

      player.nextDirection = directions[p.direction];
      player.x = x + OFFSET.X;
      player.y = y + OFFSET.Y;
    });
  });

  game.socket.on("playerMessage", (message, playerName) => {
    game.chat.addMessage(playerName, message.text);
  });
};
