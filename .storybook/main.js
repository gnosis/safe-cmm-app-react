const path = require("path");

// Required by webpack.config.js
process.env.INFURA_API_KEY = "dummy";
process.env.NETWORK = "local";

// your app's webpack.config.js
const custom = require("../webpack.config.js");

module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-actions",
    "@storybook/addon-links",
    "@storybook/addon-controls",
    "@storybook/addon-docs",
  ],
  webpackFinal: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: custom.module.rules,
      },
      resolve: {
        ...config.resolve,
        ...custom.resolve,
      },
      plugins: config.plugins.concat(custom.plugins),
    };
  },
};
