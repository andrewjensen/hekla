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
    console.log('Running...');
    console.log('');
    return Promise.resolve()
      .then(() => Analyzer.loadModules(this.config.loader))
      .then(modules => Analyzer.extractComponents(modules, this.config.parsers))
      .then(modules => Analyzer.buildDependencyGraph(modules))
      .then(dependencyGraph => Analyzer.export(dependencyGraph))
      .then(() => {
        console.log('Done.');
      })
      .catch(err => {
        console.error('Error while analyzing: ', err.stack);
      });
  }

  // ------------------------------------------------------

  static loadModules(loader) {
    console.log('  Loading modules...');
    return loader.loadModules()
      .then(modules => {
        console.log(`    Loaded ${modules.length} modules.`);
        // modules.forEach(module => console.log(`      ${module.path}`));

        console.log('');
        return modules;
      });
  }

  static extractComponents(modules, parsers) {
    console.log('  Extracting components...');
    return ParserEngine.parse(modules, parsers)
      .then(results => {
        console.log(`    Extracted ${results.components.length} components`);
        console.log(`    Caught ${results.errors.length} errors`);
        console.log('');
        console.log('    Components found:');
        results.components.forEach(component => console.log(`      ${component.name}`));
        console.log('    Errors:');
        results.errors.forEach(error => console.log(`      ${error.message}`));
        console.log('');

        return results;
      });
  }

// .then(results => {
//   console.log('Finished!');
//   console.log('\ttotal components:', results.components.length);
//   console.log('\ttotal errors:', results.errors.length);
//   console.log(results.errors.map(error => error.message).join('\n'));
//   return results;
// })
// .catch(err => {
//   console.error('Uncaught error during analysis:', err.stack);
// });




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
