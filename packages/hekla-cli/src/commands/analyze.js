'use strict';

const path = require('path');
const Analyzer = require('hekla-core').Analyzer;

module.exports = function analyze() {
  let config;

  try {
    config = require(getHeklafilePath());
  } catch (err) {
    console.error('Configuration error:', err.stack);
    process.exit(1);
  }

  const analyzer = new Analyzer(config);
  analyzer.run();
};

function getHeklafilePath() {
  return path.resolve(process.cwd(), 'Heklafile.js');
}
