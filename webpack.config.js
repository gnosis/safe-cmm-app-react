const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /(node_modules)/,
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ]
  },
  resolve: {
    modules: [
      'src', // allows absolute imports like `import "components/App"`
      'node_modules'
    ],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: [
      path.resolve(__dirname, 'assets')
    ],
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    host: '0.0.0.0'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'html', 'index.html')
    }),
    new webpack.EnvironmentPlugin({
      NETWORK: 'local',
      INFURA_API_KEY: null,
    })
  ]
}