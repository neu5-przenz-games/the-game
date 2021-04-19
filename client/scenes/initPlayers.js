import Skeleton from "../gameObjects/Skeleton";

import initClicking from "./initClicking";
import initChatInputCapture from "./initChatInputCapture";

export default (game) => {
  game.setPlayers(
    game.playersFromServer.map((player) =>
      game.add.existing(
        new Skeleton({
          direction: player.direction,
          isMainPlayer: player.socketId === game.socketId,
          hp: player.hp,
          motion: "idle",
          name: player.name,
          scene: game,
          ...game.groundLayer.tileToWorldXY(player.tileX, player.tileY),
        })
      )
    )
  );

  game.players.forEach((player) => {
    player.setInteractive();
  });

  game.input.on("gameobjectdown", (pointer, player) => {
    if (game.mainPlayerName !== player.name) {
      game.socket.emit("otherPlayerClicked", {
        name: game.mainPlayerName,
        toFollow: player.name,
      });
    }
  });

  game.setMainPlayer(game.players.find((player) => player.isMainPlayer));

  game.cameras.main.startFollow(game.mainPlayer, true);

  initClicking(game);
  initChatInputCapture(game);
};
