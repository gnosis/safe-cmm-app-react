const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

// Make sure required envs are set
if (!process.env.INFURA_API_KEY) {
  throw new Error(
    "Missing Infura key - please define the env variable `INFURA_API_KEY`"
  );
}

const ALLOWED_NETWORKS = ["mainnet", "rinkeby", "local"];

if (!ALLOWED_NETWORKS.includes(process.env.NETWORK)) {
  throw new Error(
    `Invalid or missing Network defined - please set NETWORK env variable with one of: ${ALLOWED_NETWORKS.join(
      ", "
    )}`
  );
}

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
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: { cacheDirectory: true },
          },
          {
            loader: "ts-loader",
            options: {
              // disable type checker - we will use it in fork plugin
              transpileOnly: true,
            },
          },
        ],
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
    symlinks: true,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
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
    new ForkTsCheckerWebpackPlugin(),
  ],
};
