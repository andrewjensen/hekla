const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

const REPORTED_FILE_LOCATION = path.resolve(__dirname, 'dist', 'report.txt');

class TestModulePlugin {
  apply(analyzer) {
    analyzer.hooks.moduleRawSource
      .tap('TestModulePlugin', (module, source) =>
        module.set('visited', true)
      );
  }
}

class TestReporterPlugin {
  apply(analyzer) {
    analyzer.hooks.reporter
      .tap('TestReporterPlugin', async (analyzer, analysis) => {
        const moduleCount = analysis.modules.length;
        const contents = `I found ${moduleCount} modules!`;
        await writeFile(REPORTED_FILE_LOCATION, contents);
      });
  }
}

module.exports = {
  rootPath: path.resolve(__dirname, 'src'),
  outputPath: path.resolve(__dirname, 'dist'),
  plugins: [
    new TestModulePlugin(),
    new TestReporterPlugin()
  ]
};
