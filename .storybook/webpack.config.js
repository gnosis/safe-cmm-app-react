module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: "ts-loader",
      },
      {
        loader: "react-docgen-typescript-loader",
      },
    ],
  });

  config.resolve.extensions.push(".ts", ".tsx", ".js");

  config.resolve.modules.push("src");

  config.node = {
    fs: "empty",
    child_process: "empty",
  };

  return config;
};
