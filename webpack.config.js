const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const GenerateJSONPlugin = require("generate-json-webpack-plugin");
const truncate = require("lodash/truncate");

const pkg = require("./package.json");

const path = require("path");
const webpack = require("webpack");

const isDevelopment = process.env.NODE_ENV !== "production";
const isDeployed = process.env.CONTINUOUS_INTEGRATION === "true";

// Make sure required envs are set
if (!process.env.INFURA_API_KEY) {
  throw new Error(
    "Missing Infura key - please define the env variable `INFURA_API_KEY`"
  );
}

if (process.env.NETWORK != null) {
  console.warn(
    "Network property is deprecated. The app works on any network configured in utils/constants.ts now"
  );
}

const MANIFEST_JSON = {
  name: "Gnosis Custom Market Maker",
  description:
    "Allows you to deploy, withdraw and manage your custom market maker strategies",
  iconPath: "img/appIcon.svg",
};

if (isDevelopment) {
  if (isDeployed) {
    const verString = [
      process.env.TRAVIS_COMMIT
        ? truncate(process.env.TRAVIS_COMMIT, {
            length: 6,
            omission: "",
          })
        : "unknown commit",
    ];

    MANIFEST_JSON.name += ` - ${pkg.version} - ${verString.join(" - ")}`;
  } else {
    MANIFEST_JSON.name += " - Local Dev";
  }
}
const BABELRC = {
  // Unfortunately babelrc is causing issues when trying to
  // force it to transpile something inside node_modules
  // thus the config has been moved here. Don't use .babelrc
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    "react-hot-loader/babel",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-optional-chaining",
  ],
};

module.exports = {
  devtool: isDevelopment ? "eval-source-map" : "source-map",
  target: "web",
  mode: isDevelopment ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /node_modules\/(?!@gnosis\.pm\/dex-.*).*/,
        loader: "babel-loader",
        options: BABELRC,
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
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
          "json-x-loader?exclude=ast+legacyAST+sourceMap+deployedSourceMap+source+sourcePath+ast+legacyAST+compiler+schemaVersion+updatedAt+devdoc+userdoc",
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true,
              disable: isDevelopment,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: [
      path.resolve(__dirname, "src"), // allows absolute imports like `import "components/App"`
      path.resolve(__dirname, "assets"), // for importing img and the like in code
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "build"),
    ],
    alias: {
      "react-dom": "@hot-loader/react-dom",
      fs: path.resolve(__dirname, "src", "mock", "fs-mock.js"),
    },
    symlinks: true,
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
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
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    public: process.env.PUBLIC_ENDPOINT,
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
      PKG_VERSION: pkg.version,
      CONTINUOUS_INTEGRATION: null,
      TRAVIS_BRANCH: "unknown branch",
      TRAVIS_BUILD_ID: "unknown build",
      TRAVIS_COMMIT: "unknown commit",
    }),
    // Add assets and build artifacts to the dist/ folder on build
    new CopyWebpackPlugin({
      patterns: [{ from: "assets", to: "." }],
    }),
    new ForkTsCheckerWebpackPlugin(),
    new GenerateJSONPlugin("manifest.json", MANIFEST_JSON),
  ],
};
