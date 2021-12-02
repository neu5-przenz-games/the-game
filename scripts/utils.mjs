export const getMocksType = (type = "production") =>
  ({
    mini: "mini",
    test: "test",
    production: "production",
  }[type]);
