const stringify = require('csv-stringify-as-promised');

const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

module.exports = class CSVReporterPlugin {
  constructor(config) {
    this.setConfig(config)
  }

  apply(analyzer) {
    analyzer.hooks.reporter.tap('CSVReporterPlugin', this.reporter.bind(this));
  }

  setConfig(config) {
    if (!config) {
      throw new TypeError('Plugin not configured!');
    }

    if (!config.destination) {
      throw new TypeError('Plugin destination is not configured!');
    }

    if (!config.headers) {
      throw new TypeError('Plugin headers are not configured!');
    }

    if (!config.moduleToRows) {
      throw new TypeError('Plugin `moduleToRows` mapping is not configured!');
    } else if (typeof config.moduleToRows !== 'function') {
      throw new TypeError('Plugin `moduleToRows` mapping must be a function');
    }

    const { destination, headers, moduleToRows } = config;

    this.destination = destination;
    this.headers = headers;
    this.moduleToRows = moduleToRows;
  }

  async reporter(analyzer, analysis) {
    const outputRows = [];

    outputRows.push(this.headers);

    for (let module of analysis.modules) {
      for (let moduleRow of this.moduleToRows(module)) {
        outputRows.push(moduleRow);
      }
    }

    const outputCsv = await stringify(outputRows);

    console.log(`CSVReporterPlugin: writing to output file: ${this.destination}`);
    await writeFile(this.destination, outputCsv);
  }
};
