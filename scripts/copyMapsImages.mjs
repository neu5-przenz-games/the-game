import { copyFile } from "fs";
import { MOCKS_TYPES } from "../packages/shared/utils/index.mjs";

Object.values(MOCKS_TYPES).forEach((type) => {
  copyFile(
    `tiledMap/${type}.png`,
    `packages/shared/public/assets/map/image/${type}.png`,
    (err) => {
      if (err) return console.log(err);

      return 1;
    }
  );
});
