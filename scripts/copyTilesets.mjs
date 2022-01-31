import { copyFile } from "fs";

const FILES_TO_MOVE = ["outside.png"];

FILES_TO_MOVE.forEach((filename) => {
  copyFile(
    `tiledMap/tileset/${filename}`,
    `packages/shared/public/assets/tileset/${filename}`,
    (err) => {
      if (err) return console.log(err);

      return 1;
    }
  );
});
