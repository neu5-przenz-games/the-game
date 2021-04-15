import Skeleton from "../gameObjects/Skeleton";

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

  game.setMainPlayer(game.players.find((player) => player.isMainPlayer));

  game.cameras.main.startFollow(game.mainPlayer, true);
};
