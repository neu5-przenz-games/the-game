module.exports = {
  test: (client) => {
    client
      .url("http://localhost:5000/")
      .waitForElementVisible(".settings", 10 * 1000)
      .click(".settings")
      .waitForElementVisible(".profile-wrapper__follow-checkbox", 10 * 1000)
      .click(".profile-wrapper__follow-checkbox")
      .end();
  },
};
