export class GameObject {
  constructor({ name, displayName, type, positionTile, size }) {
    this.name = name;
    this.displayName = displayName;
    this.type = type;
    this.positionTile = positionTile;

    this.size = size;
  }
}
