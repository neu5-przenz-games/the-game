const OFFSET = {
  Y: 16,
};

export class Tile {
  constructor(scene, x, y, image) {
    this.image = scene.add.image(x, y + OFFSET.Y, image);
    this.image.setVisible(false);
    this.image.setAlpha(0.5);
  }

  setPosition(x, y) {
    this.image.x = x;
    this.image.y = y + OFFSET.Y;
  }

  toggleVisible(visible) {
    this.image.setVisible(visible);
  }
}
