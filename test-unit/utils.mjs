import chai from "chai";
import {
  getObjectTiles,
  getSurroundingTiles,
} from "../packages/shared/utils/index.mjs";

chai.should();

describe("getObjectTiles function", () => {
  it("should return empty array if tileX or tileY are equal or lesser than 0", () => {
    getObjectTiles({
      positionTile: { tileX: 0, tileY: 1 },
      size: { x: 0, y: 0 },
    }).length.should.be.equal(0);

    getObjectTiles({
      positionTile: { tileX: 1, tileY: -1 },
      size: { x: 0, y: 0 },
    }).length.should.be.equal(0);
  });

  it("should return empty array if sizeX or sizeY are equal or lesser than 0", () => {
    getObjectTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 0, y: 0 },
    }).length.should.be.equal(0);
  });

  it("should return correct tiles", () => {
    getObjectTiles({
      positionTile: { tileX: 10, tileY: 10 },
    }).length.should.be.equal(1);

    getObjectTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 2, y: 2 },
    }).length.should.be.equal(4);

    getObjectTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 4, y: 3 },
    }).length.should.be.equal(12);

    getObjectTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 5, y: 5 },
    }).length.should.be.equal(25);
  });
});

describe("getSurroundingTiles function", () => {
  it("should return empty array if sizeX or sizeY are equal or lesser than 0", () => {
    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 0, y: 0 },
    }).length.should.be.equal(0);

    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 5, y: -1 },
    }).length.should.be.equal(0);

    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 0, y: 5 },
    }).length.should.be.equal(0);
  });

  it("should return correct tiles", () => {
    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 1, y: 1 },
      sizeToIncrease: { x: 1, y: 1 },
    }).length.should.be.equal(8);

    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 2, y: 2 },
      sizeToIncrease: { x: 1, y: 1 },
    }).length.should.be.equal(12);

    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 2, y: 2 },
      sizeToIncrease: { x: 4, y: 4 },
    }).length.should.be.equal(96);

    getSurroundingTiles({
      positionTile: { tileX: 10, tileY: 10 },
      size: { x: 4, y: 3 },
      sizeToIncrease: { x: 2, y: 2 },
    }).length.should.be.equal(44);
  });

  it("should not count tiles lesser than 0", () => {
    getSurroundingTiles({
      positionTile: { tileX: 1, tileY: 1 },
      size: { x: 2, y: 2 },
      sizeToIncrease: { x: 4, y: 4 },
    }).length.should.be.equal(32);
  });
});
