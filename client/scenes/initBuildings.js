import Phaser from "phaser";
import House from "../gameObjects/House";

import buildings from "../../public/assets/map/buildings";

export default (game) => {
  buildings.forEach((building) => {
    const buildingPosition = game.groundLayer.tileToWorldXY(
      building.position.x,
      building.position.y
    );

    const house = new House(
      game,
      buildingPosition.x,
      buildingPosition.y,
      "house"
    );

    game.add.existing(house);

    house.setInteractive(
      new Phaser.Geom.Polygon(House.hitAreaPoly),
      Phaser.Geom.Polygon.Contains
    );
  });
};
