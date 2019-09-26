const fs = require('fs');
const path = require('path');

const {
  Analyzer,
  ConfigValidator
} = require('hekla-core');
const {
  writeJSON
} = require('hekla-core').fsUtils;

module.exports = async function analyze(cmd) {
  const singleFileLocation = cmd.single;
  const customConfigLocation = cmd.config;

  let configPath = customConfigLocation
    ? path.resolve(process.cwd(), customConfigLocation)
    : path.resolve(process.cwd(), 'hekla.config.js');

  let config;

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

  console.log('Analyzing...');
  if (singleFileLocation) {
    const filePath = path.resolve(process.cwd(), singleFileLocation);
    const module = analyzer.createModule(filePath);
    await analyzer.processModule(module)
  } else {
    await analyzer.run();
  }

  console.log('Saving...');
  const analysis = analyzer.getAnalysis();
  await saveAnalysis(analysis, analyzer.config);
  await analyzer.processReporters(analysis);

  console.log('Done.');
};

async function saveAnalysis(analysis, config) {
  const outputFilename = config.outputPath
    ? path.resolve(config.outputPath, 'analysis.json')
    : path.resolve(config.rootPath, 'analysis.json');

  await writeJSON(analysis, outputFilename);
}
