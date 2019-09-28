const path = require('path');

// class TestModulePlugin {
//   apply(analyzer) {
//   }
// }

// class TestReporterPlugin {
//   apply(analyzer) {
//   }
// }

module.exports = {
  rootPath: path.resolve(__dirname, 'src'),
  outputPath: path.resolve(__dirname, 'dist'),
  plugins: [
  ]
};
