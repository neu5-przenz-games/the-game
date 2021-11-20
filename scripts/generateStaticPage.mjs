import ejs from "ejs";
import { writeFileSync } from "fs";

import { gameItems } from "../shared/init/gameItems/index.mjs";

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
    },
  },
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
