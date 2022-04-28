/**
 * Created by Jerome Renaux (jerome.renaux@gmail.com) on 07-02-18.
 * Modified by Jakub Kasprzyk.
 */

import { existsSync, mkdirSync, readFile, writeFile } from "fs";
import { join } from "path";
import rimraf from "rimraf";
import minimist from "minimist";
import { getMocksType } from "../packages/shared/utils/index.mjs";

const argv = minimist(process.argv.slice(2));
const mocksType = getMocksType(process.env.MAP);

const splitMap = (out = "chunks", chunkWidth = 16, chunkHeight = 16) => {
  const fileName = `${mocksType}.json`;

  const mapsPath = join("tiledMap");
  const outputDirectory = join(
    "packages",
    "shared",
    "public",
    "assets",
    "map",
    out,
    mocksType
  );

  rimraf.sync(outputDirectory);
  console.log(`${out} cleared`);

  if (!existsSync(outputDirectory)) mkdirSync(outputDirectory);

  readFile(join(mapsPath, fileName), "utf8", (err, data) => {
    if (err) throw err;
    const map = JSON.parse(data);
    const mapWidth = map.width;
    const mapHeight = map.height;
    const nbChunksHorizontal = Math.ceil(mapWidth / chunkWidth);
    const nbChunksVertical = Math.ceil(mapHeight / chunkHeight);
    const nbChunks = nbChunksHorizontal * nbChunksVertical;
    console.log(
      `Splitting into ${nbChunks} chunks (${nbChunksHorizontal} x ${nbChunksVertical}) of size (${chunkWidth} x ${chunkHeight})`
    );
    console.log(`Writing to ${outputDirectory}`);

    // Creates a master file that contains information needed to properly manage the chunks
    const master = {
      tilesets: map.tilesets, // Up to you to decide if having the tilesets data in the master file is useful or not, adapt accordingly (in this case it's not)
      orientation: map.orientation,
      renderorder: map.renderorder,
      infinite: map.infinite,
      tileWidth: map.tilewidth,
      tileHeight: map.tileheight,
      chunkWidth,
      chunkHeight,
      nbChunksHorizontal,
      nbChunksVertical,
      nbLayers: map.layers.length,
    };
    writeFile(
      join(outputDirectory, "master.json"),
      JSON.stringify(master),
      (writingError) => {
        if (writingError) throw writingError;
        console.log("Master file written");
      }
    );

    let counter = 0;
    for (let i = 0; i < nbChunks; i += 1) {
      const chunk = {
        ...map,
        layers: map.layers.map((layer) => ({
          ...layer,
          data: [...layer.data],
        })),
      };
      // Compute the coordinates of the top-left corner of the chunk in the initial map
      const x = (i % nbChunksHorizontal) * chunkWidth;
      const y = Math.floor(i / nbChunksHorizontal) * chunkHeight;
      chunk.width = Math.min(chunkWidth, mapWidth - x);
      chunk.height = Math.min(chunkHeight, mapHeight - y);
      chunk.id = i;
      // Compute the index of the tiles array of the initial map that corresponds to the top-left tile of the chunk
      const liststart = mapWidth * y + x;

      for (let j = 0; j < chunk.layers.length; j += 1) {
        // Scan all layers one by one
        const layer = chunk.layers[j];
        layer.width = chunk.width;
        layer.height = chunk.height;
        if (layer.type === "tilelayer") {
          let tmpdata = [];
          // In the initial tiles array, fetch the "slices" of tiles that belong to the chunk of interest
          for (let yi = 0; yi < layer.height; yi += 1) {
            const begin = liststart + yi * mapWidth;
            const end = begin + layer.width;
            const line = layer.data.slice(begin, end);
            tmpdata = tmpdata.concat(line);
          }
          layer.data = tmpdata;
        }
      }

      // Update tileset paths
      for (let k = 0; k < chunk.tilesets.length; k += 1) {
        const tileset = chunk.tilesets[k];
        tileset.image = join("..", tileset.image);
      }

      console.log(
        `writing chunk ${i} from ${nbChunks} created (${(i / nbChunks) * 100}%)`
      );

      writeFile(
        join(outputDirectory, `chunk${i}.json`),
        JSON.stringify(chunk),
        (writingChunkError) => { // eslint-disable-line
          if (writingChunkError) {
            throw writingChunkError;
          }

          counter += 1;

          if (counter === nbChunks) {
            console.log("All chunks created");
          }
        }
      );
    }
  });
};

splitMap(argv.i, argv.o, argv.w, argv.h);
