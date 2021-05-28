module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "no-param-reassign": ["error", { props: false }],
  },
};
