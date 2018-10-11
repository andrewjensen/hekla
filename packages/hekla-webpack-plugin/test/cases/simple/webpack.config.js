const path = require('path');
const HeklaWebpackPlugin = require('hekla-webpack-plugin');

const heklaConfig = require('./hekla.config');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new HeklaWebpackPlugin(heklaConfig)
  ]
};
