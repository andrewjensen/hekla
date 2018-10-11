const path = require('path');

const {
  LinesOfCodePlugin
} = require('hekla-core').plugins;

module.exports = {
  rootPath: path.resolve(__dirname),

  plugins: [
    new LinesOfCodePlugin()
  ]
};
