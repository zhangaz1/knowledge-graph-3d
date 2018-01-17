const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: ['d3-force-3d', 'three', 'three-orbit-controls'],
    bundle: path.resolve(__dirname, 'demo/src/index.js'),
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: [
        path.resolve(__dirname, 'node_modules'),
      ],
      use: {
        loader: 'babel-loader',
      },
    }],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    }),
  ],
  devtool: 'source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'demo'),
    disableHostCheck: true,
  },
  output: {
    path: path.resolve(__dirname, 'demo/dist'),
    filename: '[name].js',
  },
};
