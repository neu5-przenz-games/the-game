import { fileURLToPath } from "url";
import { join, resolve } from "path";
import ejs from "ejs";
import { writeFileSync } from "fs";

import { gameItems } from "shared/init/gameItems/index.mjs";
import { ITEM_TYPES } from "shared/gameItems/itemTypes.mjs";

const getDirname = (meta) => fileURLToPath(meta.url);
const rootDir = getDirname(import.meta);
const wikiDir = resolve(rootDir, "../../", "wiki");
const sharedPublicWikiDir = resolve(rootDir, "../../../", "shared/public/wiki");

const gameItemsArr = Array.from(gameItems, ([id, obj]) => obj); // eslint-disable-line

const itemsPages = Object.values(ITEM_TYPES).map((itemType) => ({
  sourcePath: join(wikiDir, "items", `${itemType}.ejs`),
  outputPath: join(sharedPublicWikiDir, "items", `${itemType}.html`),
  data: {
    gameItems: gameItemsArr.filter((item) => item.type === itemType),
    ITEM_TYPES,
  },
}));

const pages = [
  {
    sourcePath: join(wikiDir, `index.ejs`),
    outputPath: join(sharedPublicWikiDir, `index.html`),
  },
  {
    sourcePath: join(wikiDir, `items.ejs`),
    outputPath: join(sharedPublicWikiDir, `items.html`),
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
