module.exports = {
  test: (client) => {
    client
      .url("http://localhost:5000/")
      .waitForElementVisible(".settings")
      .click(".settings")
      .waitForElementVisible(".profile-wrapper__follow-checkbox")
      .click(".profile-wrapper__follow-checkbox")
      .end();
  },
};
