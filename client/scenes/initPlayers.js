import Skeleton from "../gameObjects/Skeleton";

import initEventsCapturing from "./initEventsCapturing";

export default (game, players) => {
  game.setPlayers(
    players.map((player) =>
      game.add.existing(
        new Skeleton({
          direction: player.direction,
          isMainPlayer: player.name === game.mainPlayerName,
          hp: player.hp,
          motion: "idle",
          name: player.name,
          scene: game,
          x: player.x,
          y: player.y,
        })
      )
    )
  );

  game.players.forEach((player) => {
    player.setInteractive();
  });

  game.setMainPlayer(game.players.get(game.mainPlayerName));

  game.cameras.main.startFollow(game.mainPlayer, true);

  initEventsCapturing(game);
};
