'use strict';

const path = require('path');
const Analyzer = require('hekla-core').Analyzer;

module.exports = function analyze() {
  let config;
  const configPath = getHeklafilePath();

  try {
    config = require(configPath);
  } catch (err) {
    console.error('Configuration error:', err.stack);
    process.exit(1);
  }

  const analyzer = new Analyzer(config, configPath);
  analyzer.run();
};

function getHeklafilePath() {
  return path.resolve(process.cwd(), 'Heklafile.js');
}
