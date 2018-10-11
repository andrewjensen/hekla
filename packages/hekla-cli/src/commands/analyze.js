const fs = require('fs');
const path = require('path');

const {
  Analyzer,
  ConfigValidator
} = require('hekla-core');

module.exports = function analyze(cmd) {
  const { single } = cmd;
  let config;

  const configPath = path.resolve(process.cwd(), 'hekla.config.js');

  try {
    config = require(configPath);
  } catch (err) {
    console.error('Unable to evaluate config file:', err.stack);
    process.exit(1);
  }

  const validator = new ConfigValidator();
  validator.validate(config);

  if (!validator.isValid()) {
    console.log('Invalid Hekla configuration:');
    for (let error of validator.getErrors()) {
      console.log(`  ${error}`);
    }
    console.log();
    process.exit(1);
  }

  const analyzer = new Analyzer();
  analyzer.setInputFileSystem(fs);
  analyzer.applyConfig(config);

  if (single) {
    const filePath = path.resolve(process.cwd(), single);

    const module = analyzer.createModule(filePath);
    analyzer.processModule(module)
      .then(() => {
        // TODO: Save JSON
        const analysis = analyzer.getAnalysis();
        const json = JSON.stringify(analysis, null, 2);
        console.log(json);
      });
  }
};
