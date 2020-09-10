const { EnvironmentPlugin } = require("webpack");

const path = require("path");

// Required by webpack.config.js
process.env.INFURA_API_KEY = "dummy";
process.env.NETWORK = "local";

// app's webpack.config.js
const custom = require("../webpack.config.js");

// the minimum plugins required
// to inline CONFIG and other env vars
const customPlugins = custom.plugins.filter(
  (pl) => pl instanceof EnvironmentPlugin
);

module.exports = {
  stories: ["../src/**/*.stories.tsx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-actions",
    "@storybook/addon-links",
    "@storybook/addon-controls",
  ],
  webpackFinal: (config) => {
    // I know, I know, using obj destruction assignment (config = {...config, prop: overwrite}) looks better, etc
    // but after a few hours fighting with the build I figured it out it wasn't working. And, I found out that
    // this way works, so, there you have it. Happy to change back if anyone can show how to make it work.

    // important for absolute path resolution
    Object.keys(custom.resolve.modules).forEach(
      (key) => (config.resolve.modules[key] = custom.resolve.modules[key])
    );

    // enable plugins override sparingly
    // only if storybook doesn't work as is
    // pulling in every plugin currently breaks production build
    config.plugins = config.plugins.concat(customPlugins);

    // Get the `jsx?` rule to skip `@gnosis.pm/dex-` files, currently causing issues
    config.module.rules.push(custom.module.rules[0]);

    // Aliases for mocking things inside the stories
    config.resolve.alias["hooks/useGetPrice"] = require.resolve(
      "../src/mock/useGetPrice.ts"
    );
    config.resolve.alias["hooks/useTokenList"] = require.resolve(
      "../src/mock/useTokenList.ts"
    );
    config.resolve.alias["hooks/useTokenDetails"] = require.resolve(
      "../src/mock/useTokenDetails.ts"
    );
    config.resolve.alias["hooks/useTokenBalance"] = require.resolve(
      "../src/mock/useTokenBalance.ts"
    );

    return config;
  },
};
