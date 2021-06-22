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
    ecmaFeatures: {
      modules: true,
    },
  },
  plugins: ["import"],
  rules: {
    "import/no-unresolved": 2,
    "import/no-commonjs": 2,
    "import/extensions": [2, "ignorePackages"],
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "no-param-reassign": ["error", { props: false }],
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
  },
};
