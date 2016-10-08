'use strict';

const BaseLoader = require('../loaders/base-loader');
const BaseParser = require('../parsers/base-parser');

const ParserEngine = require('./parser-engine');
const utils = require('../utils');

const DEBUG = false;

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
      .then(results => Analyzer.buildDependencyGraph(results.components))
      .then(dependencyGraph => Analyzer.export(dependencyGraph, this.config.output))
      .then(() => {
        console.log('Done.');
      })
      .catch(err => {
        console.error('Error while analyzing: ', err.stack);
        return Promise.reject(err);
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
        if (DEBUG) {
          console.log('    Components found:');
          results.components.forEach(component => console.log(`      ${component.name}`));
          console.log('');
          console.log('    Errors:');
          results.errors.forEach(error => console.log(`      ${error.message}`));
          console.log('');
        }

        return results;
      });
  }

  static buildDependencyGraph(components) {
    console.log('  Building dependency graph...');
    return ParserEngine.buildDependencyGraph(components)
      .then(dependencyGraph => {
        console.log(`    Created ${dependencyGraph.links.length} links.`);
        console.log('');
        return dependencyGraph;
      });
  }

  static export(dependencyGraph, outputFilename) {
    console.log('  Exporting...');
    const exportable = {
      components: dependencyGraph.nodes.map(node => node.value),
      componentDependencies: dependencyGraph.links
    };
    return utils.writeJSON(exportable, outputFilename)
      .then(() => {
        console.log(`    Saved to ${outputFilename}`);
        console.log('');
      });
    return Promise.resolve();
  }

  static isValidConfig(config) {
    if (!config.loader || !(config.loader instanceof BaseLoader)) {
      return false;
    } else if (!config.parsers) {
      return false;
    } else if (!config.output) {
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
