import Phaser from "phaser";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";

import { initGameObjects } from "../inits/gameObjects.mjs";
import { sockets } from "../events/sockets.mjs";

import { UIPlayerStatusList } from "../ui/playerList/playerStatusList.mjs";

import { UIChat } from "../ui/sections/chat/chat.mjs";

import { debugMenu } from "../ui/debugMenu.mjs";

import { FRACTIONS } from "../../shared/fractions/index.mjs";
import { getMocksType } from "../../shared/utils/index.mjs";
import { config } from "../../generated/config.mjs";

const FPS = 30;
const MAP_UPDATE_INTERVAL_MS = 500;

const findDiffArrayElements = (firstArray, secondArray) =>
  firstArray.filter((i) => secondArray.indexOf(i) < 0);

export class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");

    this.mainPlayer = null;
    this.mainPlayerName = null;
    this.players = new Map();
    this.gameObjects = [];
    this.playerList = new UIPlayerStatusList();
    this.profile = null;
    this.settings = null;
    this.selectedObject = null;
    this.chat = new UIChat();
    this.socket = null;
    this.socketId = null;
    this.SI = new SnapshotInterpolation(FPS);
    this.timer = 0;
    this.mapType = getMocksType(process.env.MAP);

    this.equipment = null;
    this.backpack = null;

    this.mapImgDimensions = config.mapImgDimensions;

    // ui
    const [menu] = document.getElementsByClassName("menu");
    this.UIMenu = menu;

    if (process.env.NODE_ENV === "development") {
      debugMenu(this);

      window.e2e = {
        isPlayerDead: (playerName) => this.players.get(playerName).getIsDead(),
        getPlayerCurrentPositionTile: (playerName) =>
          this.players.get(playerName).getCurrentPositionTile(),
        getPlayerEquipmentItemsLength: () => Object.keys(this.equipment).length,
        getPlayerBackpackItemsLength: () => this.backpack.items.length,
      };
    }
  }

  preload() {
    this.load.image("tileset-outside", "./assets/tileset/outside.png");

    // objects
    this.load.image("HealingStone", "./assets/gfx/healing-stone.png");
    this.load.image(
      "HealingStoneParticle",
      "./assets/gfx/healing-stone-particle.png"
    );
    this.load.image("House", "./assets/gfx/house.png");
    this.load.image("Tree", "./assets/gfx/tree.png");
    this.load.image("CopperOre", "./assets/gfx/ore-copper.png");

    this.load.image("looting-bag", "./assets/gfx/looting-bag.png");

    this.load.image("tile-marked", "./assets/gfx/tile-marked.png");
    this.load.image("tile-selected", "./assets/gfx/tile-selected.png");
    this.load.image("tile-fight", "./assets/gfx/tile-fight.png");

    this.load.image("arrow-bow", "./assets/gfx/arrow-bow.png");

    this.load.image("particle-red", "./assets/gfx/particle-red.png");
    this.load.image("particle-yellow", "./assets/gfx/particle-yellow.png");
    this.load.image(
      "particle-healing-green",
      "./assets/gfx/particle-healing-green.png"
    );

    this.load.image("buff-dizzy", "./assets/gfx/buff-dizzy.png");

    this.load.spritesheet("fire-sprite", "./assets/gfx/fire.png", {
      frameWidth: 64,
      frameHeight: 64,
      endFrame: 23,
    });

    this.cache.tilemap.events.on("add", (cache, key) => {
      this.displayChunk(key);
    });

    this.load.tilemapTiledJSON(
      "master",
      `./assets/map/chunks/${this.mapType}/master.json`
    );

    FRACTIONS.forEach((fraction) => {
      this.load.spritesheet(
        fraction.name,
        `./assets/character/${fraction.characterImg}.png`,
        {
          frameWidth: 128,
          frameHeight: 128,
        }
      );
    });

    this.load.spritesheet("mob-cupid", "./assets/mob/cupid.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("mob-devil", "./assets/mob/devil.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
  }

  getTileFromXY(x, y) {
    const CLICKING_OFFSET = 32;

    const realX = x - CLICKING_OFFSET;
    const realY = y - CLICKING_OFFSET;

    return {
      x: Math.floor(realY / this.tileHeight + realX / this.tileWidth),
      y: Math.floor((realX / this.tileWidth - realY / this.tileHeight) * -1),
    };
  }

  setSocket(socket) {
    this.socket = socket;
  }

  setSocketId(socketId) {
    this.socketId = socketId;
  }

  setPlayers(players) {
    players.forEach((player) => {
      this.players.set(player.name, player);
    });
  }

  removePlayers() {
    this.players.forEach((player) => {
      player.destroy();
    });
    this.players.clear();
    this.playerList.clear();
  }

  setMainPlayer(mainPlayer) {
    this.mainPlayer = mainPlayer;
  }

  setMainPlayerName(mainPlayerName) {
    this.mainPlayerName = mainPlayerName;
  }

  setSettings(settings) {
    this.settings = settings;
  }

  setEquipment(equipment) {
    this.equipment = equipment;
    this.profile.setEquipment(equipment);
  }

  setBackpack(backpack) {
    this.profile.setBackpack(backpack);
    this.backpack = backpack;
  }

  setSkills(skills) {
    this.profile.setSkills(skills);
  }

  setSelectedObject(selectedObject) {
    this.selectedObject = selectedObject;
  }

  setProfile(profile) {
    this.profile = profile;
  }

  resetSelectedObject() {
    this.selectedObject = null;
    this.profile.disableSelectionButton();
    this.profile.resetSelectedName();
    this.profile.resetActionButton();
  }

  computeChunkID({ x, y }) {
    const tile = this.getTileFromXY(x, y);

    const chunkX = Math.floor(tile.x / this.chunkWidth);
    const chunkY = Math.floor(tile.y / this.chunkHeight);

    return chunkY * this.nbChunksHorizontal + chunkX;
  }

  displayChunk(key) {
    if (key === "master") {
      return;
    }

    const tilemap = this.make.tilemap({ key });

    const tilesetOutside = tilemap.addTilesetImage(
      "outside",
      "tileset-outside"
    );

    // We need to compute the position of the chunk in the world
    const chunkID = parseInt(key.match(/\d+/)[0], 10); // Extracts the chunk number from file name

    const chunkRow = Math.floor(chunkID / this.nbChunksHorizontal);
    const chunkCol = chunkID % this.nbChunksHorizontal;
    const isCenterChunk = (chunkID - chunkRow) % this.nbChunksHorizontal;

    let offset;

    if (isCenterChunk === 0) {
      offset = {
        x: 0,
        y: chunkRow * this.HALF_WIDTH_OF_CHUNK,
      };
    } else if (chunkID < this.nbChunksHorizontal * chunkRow + chunkRow) {
      offset = {
        x:
          -(chunkRow * this.HALF_WIDTH_OF_CHUNK) +
          (chunkID % this.nbChunksHorizontal) * this.HALF_WIDTH_OF_CHUNK,
        y:
          chunkRow * this.HALF_HEIGHT_OF_CHUNK +
          (chunkID % this.nbChunksHorizontal) * this.HALF_HEIGHT_OF_CHUNK,
      };
    } else {
      offset = {
        x:
          ((chunkCol - chunkRow) % this.nbChunksHorizontal) *
          this.HALF_WIDTH_OF_CHUNK,
        y: (chunkRow + chunkCol) * this.HALF_HEIGHT_OF_CHUNK,
      };
    }

    tilemap.createLayer("Water", tilesetOutside, offset.x, offset.y);
    tilemap.createLayer("Ground", tilesetOutside, offset.x, offset.y);
    const onGroundLayer = tilemap.createLayer(
      "OnGround",
      tilesetOutside,
      offset.x,
      offset.y
    );
    const collidesLayer = tilemap.createLayer(
      "Collides",
      tilesetOutside,
      offset.x,
      offset.y
    );

    for (let { y } = offset; y < tilemap.height; y += 1) {
      for (let { x } = offset; x < tilemap.width; x += 1) {
        const tileOnGround = tilemap.getTileAt(x, y, true, onGroundLayer);
        const tileCollides = tilemap.getTileAt(x, y, true, collidesLayer);
        if (tileOnGround.index !== -1) {
          const layer = tilemap.createBlankLayer(
            `Layer onGround x:${x} y:${y}`,
            tilesetOutside,
            x,
            y,
            tilemap.tileWidth,
            tilemap.tileHeight,
            tilemap.tileWidth,
            tilemap.tileWidth
          );
          tilemap.putTileAt(tileOnGround, x, y, true, layer);
          // this is special case for tile.index = 128: it should be behind the player
          layer.depth =
            tileOnGround.index === 128
              ? tileOnGround.bottom - 1
              : tileOnGround.bottom + 1;
        }
        if (tileCollides.index !== -1) {
          const layer = tilemap.createBlankLayer(
            `Layer collides x:${x} y:${y}`,
            tilesetOutside,
            x,
            y,
            tilemap.tileWidth,
            tilemap.tileHeight,
            tilemap.tileWidth,
            tilemap.tileWidth
          );
          tilemap.putTileAt(tileCollides, x, y, true, layer);
          layer.depth = tileCollides.bottom + 1;
        }
      }
    }

    this.maps[chunkID] = tilemap;
    this.displayedChunks.push(chunkID);
  }

  listAdjacentChunks(chunkID) {
    const chunks = [];
    const isAtTop = chunkID < this.nbChunksHorizontal;
    const isAtBottom = chunkID > this.lastChunkID - this.nbChunksHorizontal;
    const isAtLeft = chunkID % this.nbChunksHorizontal === 0;
    const isAtRight =
      chunkID % this.nbChunksHorizontal === this.nbChunksHorizontal - 1;
    chunks.push(chunkID);
    if (!isAtTop) chunks.push(chunkID - this.nbChunksHorizontal);
    if (!isAtBottom) chunks.push(chunkID + this.nbChunksHorizontal);
    if (!isAtLeft) chunks.push(chunkID - 1);
    if (!isAtRight) chunks.push(chunkID + 1);
    if (!isAtTop && !isAtLeft)
      chunks.push(chunkID - 1 - this.nbChunksHorizontal);
    if (!isAtTop && !isAtRight)
      chunks.push(chunkID + 1 - this.nbChunksHorizontal);
    if (!isAtBottom && !isAtLeft)
      chunks.push(chunkID - 1 + this.nbChunksHorizontal);
    if (!isAtBottom && !isAtRight)
      chunks.push(chunkID + 1 + this.nbChunksHorizontal);
    return chunks;
  }

  removeChunk(chunkID) {
    this.maps[chunkID].destroy();
    delete this.maps[chunkID];
    this.cache.tilemap.remove(`chunk${chunkID}`);

    const idx = this.displayedChunks.indexOf(chunkID);

    if (idx > -1) {
      this.displayedChunks.splice(idx, 1);
    }
  }

  create() {
    this.maps = {}; // Maps chunk id's to the corresponding tilemaps; used to be able to destroy them
    this.displayedChunks = []; // List of the id's of the chunks currently displayed

    const {
      data: {
        chunkHeight,
        chunkWidth,
        nbChunksHorizontal,
        nbChunksVertical,
        tileWidth,
        tileHeight,
      },
    } = this.cache.tilemap.get("master");

    this.chunkWidth = chunkHeight;
    this.chunkHeight = chunkWidth;
    this.nbChunksHorizontal = nbChunksHorizontal;
    this.nbChunksVertical = nbChunksVertical;

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.HALF_WIDTH_OF_CHUNK = (this.chunkWidth / 2) * this.tileWidth;
    this.HALF_HEIGHT_OF_CHUNK = (this.chunkHeight / 2) * this.tileHeight;

    this.lastChunkID = this.nbChunksHorizontal * this.nbChunksVertical - 1;

    initGameObjects(this);
    sockets(this);
  }

  updateMap() {
    const chunkID = this.computeChunkID(this.mainPlayer);
    const chunks = this.listAdjacentChunks(chunkID);
    const newChunks = findDiffArrayElements(chunks, this.displayedChunks); // Lists the surrounding chunks that are not displayed yet (and have to be)
    const oldChunks = findDiffArrayElements(this.displayedChunks, chunks); // Lists the surrounding chunks that are still displayed (and shouldn't anymore)

    newChunks.forEach((chunk) => {
      this.load.tilemapTiledJSON(
        `chunk${chunk}`,
        `./assets/map/chunks/${this.mapType}/chunk${chunk}.json`
      );
    });

    if (newChunks.length > 0) {
      this.load.start();
    }

    oldChunks.forEach((chunk) => {
      this.removeChunk(chunk);
    });
  }

  update(time, delta) {
    this.timer += delta;

    while (this.timer > MAP_UPDATE_INTERVAL_MS) {
      this.timer -= MAP_UPDATE_INTERVAL_MS;
      this.updateMap();
    }

    if (this.players.size) {
      const snap = this.SI.calcInterpolation("x y");
      if (!snap) return;

      const { state } = snap;
      if (!state) return;

      state.forEach((player) => {
        const playerToUpdate = this.players.get(player.id);
        playerToUpdate.update(player);
      });
    }
  }
}
