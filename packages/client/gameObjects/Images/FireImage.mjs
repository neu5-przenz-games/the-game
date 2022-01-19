export class FireImage {
  constructor({ scene, x, y }) {
    scene.anims.create({
      key: "fire",
      frames: "fire-sprite",
      frameRate: 16,
      repeat: -1,
    });

    this.image = scene.add.sprite(x, y, "fire-sprite").play("fire");
  }
}
