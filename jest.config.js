module.exports = {
  preset: "ts-jest/presets/default",
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/test/mocks/fileMock.ts",
    "\\.(css|less)$": "<rootDir>/test/mocks/styleMock.ts",
    "hooks/(.*)$": "<rootDir>/src/mocks/$1",
  },
  transformIgnorePatterns: [
    // "/node_modules/(?!@gnosis.pm/dex-.*).*/",
    // ".*GlobalStyle.*",
    // "node_modules/(?!@storybook/*)",
    //   "\\.pnp\\.[^\\/]+$"
  ],
  globals: {
    "ts-jest": {
      diagnostics: {
        warnOnly: true,
      },
      babelConfig: {
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "current",
              },
            },
          ],
          "@babel/preset-react",
        ],
        plugins: [
          "@babel/plugin-syntax-dynamic-import",
          "@babel/plugin-proposal-optional-chaining",
          // "@babel/plugin-syntax-jsx",
          [
            "babel-plugin-styled-components",
            {
              displayName: true,
              pure: true,
            },
          ],
        ],
      },
    },
  },
};
