module.exports = {
  src_folders: ["e2e"],
  custom_commands_path: "e2e-commands/",
  page_objects_path: "e2e-page-objects",
  webdriver: {
    start_process: true,
    port: 4444,
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["--headless", "--no-sandbox", "--disable-gpu"],
        },
      },
      webdriver: { server_path: require("chromedriver").path },
    },
  },
};
