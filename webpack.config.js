const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /(node_modules)/,
        use: ["babel-loader"],
      },
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.json$/,
        use: [
          // allows artifact loading with a lower filesize by omitting all keys except abi, network and events
          "json-x-loader?exclude=bytecode+deployedBytecode+ast+legacyAST+sourceMap+deployedSourceMap+source+sourcePath+ast+legacyAST+compiler+schemaVersion+updatedAt+devdoc+userdoc",
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
    },
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: [path.resolve(__dirname, "assets")],
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
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
