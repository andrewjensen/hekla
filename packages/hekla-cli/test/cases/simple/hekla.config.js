const path = require('path');

class TestModulePlugin {
  apply(analyzer) {
    analyzer.hooks.moduleRawSource
      .tap('TestModulePlugin', (module, source) =>
        module.set('visited', true)
      );
  }
}

// class TestReporterPlugin {
//   apply(analyzer) {
//   }
// }

module.exports = {
  rootPath: path.resolve(__dirname, 'src'),
  outputPath: path.resolve(__dirname, 'dist'),
  plugins: [
    new TestModulePlugin()
  ]
};
