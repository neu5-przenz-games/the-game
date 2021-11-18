import ejs from "ejs";
import { writeFileSync } from "fs";

ejs.renderFile("./server/pages/wiki/index.ejs", {}, {}, (err, str) => {
  if (err) {
    console.log(err);
  } else {
    writeFileSync("./public/wiki/index.html", str, (error) => {
      if (error) return console.log(error);

      return 1;
    });
  }
});
