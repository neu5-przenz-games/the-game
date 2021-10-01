import Phaser from "phaser";

export class LootingBag extends Phaser.GameObjects.Image {
  constructor(scene, x, y, imageName, name, displayName = "Looting Bag") {
    super(scene, x + 32, y + 40, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 32;
  }

  static TYPE = "LootingBag";

  static hitAreaSize = {
    width: 32,
    height: 32,
  };
}
