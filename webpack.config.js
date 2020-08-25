const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "eval-source-map",
  target: "web",
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules\/(?!@gnosis\.pm\/dex-.*).*/,
        loader: "babel-loader",
        options: {
          // Unfortunately babelrc is causing issues when trying to
          // force it to transpile something inside node_modules
          // thus the config has been moved here. Don't use .babelrc
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "react-hot-loader/babel",
            "@babel/plugin-syntax-dynamic-import",
            "@babel/plugin-proposal-optional-chaining",
          ],
        }
      },
      {
        test: /\.woff2?/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.json$/,
        use: [
          // allows artifact loading with a lower filesize by omitting all keys except abi, network and events
          "json-x-loader?exclude=ast+legacyAST+sourceMap+deployedSourceMap+source+sourcePath+ast+legacyAST+compiler+schemaVersion+updatedAt+devdoc+userdoc",
        ],
      },
    ],
  },
  resolve: {
    modules: [
      "src", // allows absolute imports like `import "components/App"`
      "build",
      "node_modules",
    ],
    alias: {
      "react-dom": "@hot-loader/react-dom",
      fs: path.resolve(__dirname, "src", "mock", "fs-mock.js"),
    },
    symlinks: true,
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: [
      path.resolve(__dirname, "assets"),
      path.resolve(__dirname, "build"),
    ],
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    public: "cmm-safe-app.ngrok.io/",
    port: 8080,
    host: "0.0.0.0",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "html", "index.html"),
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      NETWORK: "local",
      INFURA_API_KEY: null,
    }),
  ],
};
