export const wikiPages = (app, distDir) => {
  app.get("/wiki", (req, res) => {
    res.sendFile("wiki/index.html", { root: distDir });
  });

  app.get("/wiki/items", (req, res) => {
    res.sendFile("wiki/items.html", { root: distDir });
  });

  app.get("/wiki/items/:pageID", (req, res) => {
    res.sendFile(`wiki/items/${req.params.pageID}.html`, {
      root: distDir,
    });
  });
};
