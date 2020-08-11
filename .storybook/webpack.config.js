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

  config.module.rules.push({
    test: /\.(woff|woff2|eot|ttf)$/,
    use: [
      {
        loader: "file-loader",
        query: {
          name: "[name].[ext]",
        },
      },
    ],
  });

  config.module.rules.push({
    test: /\.(svg|png|jpg)$/i,
    use: [
      {
        loader: "url-loader",
        query: {
          name: "[name].[ext]",
        },
      },
    ],
  });

  config.resolve.extensions.push(".ts", ".tsx", "woff2");

  config.resolve.modules.push("src");

  config.node = {
    fs: "empty",
    child_process: "empty",
  };

  return config;
};
