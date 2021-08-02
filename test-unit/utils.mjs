import chai from "chai";
import { getObjectTiles, getSurroundingTiles } from "../shared/utils.mjs";

chai.should();

describe("getObjectTiles function", () => {
  it("should return empty array if tileX or tileY are equal or lesser than 0", () => {
    getObjectTiles({
      tileX: 0,
      tileY: 1,
      sizeX: 0,
      sizeY: 0,
    }).length.should.be.equal(0);

    getObjectTiles({
      tileX: 1,
      tileY: -1,
      sizeX: 0,
      sizeY: 0,
    }).length.should.be.equal(0);
  });

  it("should return empty array if sizeX or sizeY are equal or lesser than 0", () => {
    getObjectTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 0,
      sizeY: 0,
    }).length.should.be.equal(0);
  });

  it("should return correct tiles", () => {
    getObjectTiles({
      tileX: 10,
      tileY: 10,
    }).length.should.be.equal(1);

    getObjectTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 2,
      sizeY: 2,
    }).length.should.be.equal(4);

    getObjectTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 4,
      sizeY: 3,
    }).length.should.be.equal(12);

    getObjectTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 5,
      sizeY: 5,
    }).length.should.be.equal(25);
  });
});

describe("getSurroundingTiles function", () => {
  it("should return empty array if sizeX or sizeY are equal or lesser than 0", () => {
    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 0,
      sizeY: 0,
    }).length.should.be.equal(0);

    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 5,
      sizeY: -1,
    }).length.should.be.equal(0);

    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 0,
      sizeY: 5,
    }).length.should.be.equal(0);
  });

  it("should return correct tiles", () => {
    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 1,
      sizeY: 1,
      sizeToIncreaseX: 1,
      sizeToIncreaseY: 1,
    }).length.should.be.equal(8);

    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 2,
      sizeY: 2,
      sizeToIncreaseX: 1,
      sizeToIncreaseY: 1,
    }).length.should.be.equal(12);

    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 2,
      sizeY: 2,
      sizeToIncreaseX: 4,
      sizeToIncreaseY: 4,
    }).length.should.be.equal(96);

    getSurroundingTiles({
      tileX: 10,
      tileY: 10,
      sizeX: 4,
      sizeY: 3,
      sizeToIncreaseX: 2,
      sizeToIncreaseY: 2,
    }).length.should.be.equal(44);
  });

  it("should not count tiles lesser than 0", () => {
    getSurroundingTiles({
      tileX: 1,
      tileY: 1,
      sizeX: 2,
      sizeY: 2,
      sizeToIncreaseX: 4,
      sizeToIncreaseY: 4,
    }).length.should.be.equal(32);
  });
});
