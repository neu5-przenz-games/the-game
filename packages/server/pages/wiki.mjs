export const wikiPages = (app) => {
  app.get("/wiki", (req, res) => {
    res.sendFile("wiki/index.html", { root: "./dist" });
  });

  app.get("/wiki/items", (req, res) => {
    res.sendFile("wiki/items.html", { root: "./dist" });
  });

  app.get("/wiki/items/:pageID", (req, res) => {
    res.sendFile(`wiki/items/${req.params.pageID}.html`, { root: "./dist" });
  });
};
