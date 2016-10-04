'use strict';

const BaseLoader = require('../loaders/base-loader');
const BaseParser = require('../parsers/base-parser');

const ParserEngine = require('./parser-engine');

module.exports = class Analyzer {
  constructor(config) {
    if (!Analyzer.isValidConfig(config)) {
      throw new Error('Invalid configuration');
    }

    this.config = config;
    this.modules = [];
  }

  run() {
    console.log('running...');
    console.log('');
    return Promise.resolve()
      .then(() => Analyzer.loadModules(this.config.loader))
      .then(modules => Analyzer.parseModules(modules, this.config.parsers))
      .then(modules => Analyzer.buildDependencyGraph(modules))
      .then(dependencyGraph => Analyzer.export(dependencyGraph))
      .then(() => {
        console.log('done.');
      })
      .catch(err => {
        console.error('Error while analyzing: ', err);
      });
  }

  // ------------------------------------------------------

  static loadModules(loader) {
    console.log('  loading modules...');
    return loader.loadModules()
      .then(modules => {
        console.log(`    Loaded ${modules.length} modules.`);
        // modules.forEach(module => console.log(`      ${module.path}`));

        console.log('');
        return modules;
      });
  }

  static parseModules(modules, parsers) {
    console.log('  parsing contents...');
    return ParserEngine.parse(modules, parsers)
      .then(results => {
        console.log(`    parsed ${results.length} modules.`);
        console.log('');
        return results;
      });
  }

  static buildDependencyGraph(modules) {
    console.log('  building dependency graph...');
    console.log('');
    return Promise.resolve();
  }

  static export(dependencyGraph) {
    console.log('  exporting...');
    console.log('');
    return Promise.resolve();
  }

  static isValidConfig(config) {
    if (!config.loader || !(config.loader instanceof BaseLoader)) {
      return false;
    } else if (!config.parsers) {
      return false;
    }

    let parsersValid = config.parsers
      .reduce((parsersValid, parser) => (!parsersValid ? false : (parser instanceof BaseParser)), true);
    if (!parsersValid) {
      return false;
    }

    return true;
  }
};
