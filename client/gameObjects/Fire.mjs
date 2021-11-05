const OFFSET = {
  Y: 16,
};

export class Fire {
  constructor(scene, x, y) {
    scene.anims.create({
      key: "fire-gif",
      frames: "fire-gif",
      frameRate: 16,
      repeat: -1,
    });
    this.image = scene.add.sprite(x, y, "fire-gif").play("fire-gif");
  }

  setPosition(x, y) {
    this.image.x = x;
    this.image.y = y + OFFSET.Y;
    this.image.depth = this.image.y + 2;
  }
}
