const fs = require('fs');
const path = require('path');

const Analyzer = require('hekla-core').Analyzer;

module.exports = function analyze(cmd) {
  const { single } = cmd;

  console.log('Analyzing!');

  if (single) {
    console.log('Analyze just a single file:', single);

    const filePath = path.resolve(process.cwd(), single);

    console.log('Resolved:', filePath);

    const analyzer = new Analyzer();
    analyzer.setInputFileSystem(fs);
    const module = analyzer.createModule(filePath);
    analyzer.processModule(module)
      .then(() => {
        // TODO: Save JSON
        const analysis = analyzer.getAnalysis();
        const json = JSON.stringify(analysis, null, 2);
        console.log(json);
      });
  }

  // let config;
  // const configPath = getHeklafilePath();

  // try {
  //   config = require(configPath);
  // } catch (err) {
  //   console.error('Configuration error:', err.stack);
  //   process.exit(1);
  // }

  // const analyzer = new Analyzer(config, configPath);
  // analyzer.run();
};

// function getHeklafilePath() {
//   return path.resolve(process.cwd(), 'Heklafile.js');
// }
