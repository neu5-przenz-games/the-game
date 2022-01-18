import ejs from "ejs";
import { writeFileSync } from "fs";

import { gameItems } from "../packages/shared/init/gameItems/index.mjs";
import { ITEM_TYPES } from "../packages/shared/gameItems/itemTypes.mjs";

const gameItemsArr = Array.from(gameItems, ([id, obj]) => obj); // eslint-disable-line

const itemsPages = Object.values(ITEM_TYPES).map((itemType) => ({
  sourcePath: `./pages/wiki/items/${itemType}.ejs`,
  outputPath: `./public/wiki/items/${itemType}.html`,
  data: {
    gameItems: gameItemsArr.filter((item) => item.type === itemType),
    ITEM_TYPES,
  },
}));

const pages = [
  {
    sourcePath: "./pages/wiki/index.ejs",
    outputPath: "./public/wiki/index.html",
  },
  {
    sourcePath: "./pages/wiki/items.ejs",
    outputPath: "./public/wiki/items.html",
    data: {
      gameItems,
      ITEM_TYPES,
    },
  },
  ...itemsPages,
];

pages.forEach(({ sourcePath, outputPath, data = {} }) => {
  ejs.renderFile(sourcePath, data, {}, (err, str) => {
    if (err) {
      console.log(`Error in ${sourcePath}: ${err}`);
    } else {
      writeFileSync(outputPath, str, (error) => {
        if (error) return console.log(`Error in ${sourcePath}: ${error}`);

        return 1;
      });
    }
  });
});
