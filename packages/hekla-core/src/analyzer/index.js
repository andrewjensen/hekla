'use strict';

const path = require('path');

const BaseLoader = require('../loaders/BaseLoader');
const BaseParser = require('../parsers/BaseParser');

const ParserEngine = require('./parser-engine');
const fsUtils = require('../utils/fs-utils');

module.exports = class Analyzer {
  constructor(config, configPath) {
    this.config = Analyzer.expandConfig(config, configPath);
    this.modules = [];
  }

  run() {
    console.log('Running...');
    console.log('');
    return Promise.resolve()
      .then(() => Analyzer.loadModules(this.config.loader))
      .then(modules => Analyzer.extractComponents(modules, this.config.parsers, this.config.debug))
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

  static extractComponents(modules, parsers, debug) {
    console.log('  Extracting components...');
    return ParserEngine.parse(modules, parsers)
      .then(results => {
        console.log(`    Extracted ${results.components.length} components`);
        console.log(`    Caught ${results.errors.length} errors`);
        console.log('');
        if (debug) {
          console.log('    Components found:');
          results.components.forEach(component => console.log(`      ${component.name}`));
          console.log('');
          console.log('    Errors:');
          results.errors.forEach(error => {
            console.log(`      ${error.modulePath}:`);
            console.log(`        ${error.message}`);
          });
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
    return fsUtils.writeJSON(exportable, outputFilename)
      .then(() => {
        console.log(`    Saved to ${outputFilename}`);
        console.log('');
      });
    return Promise.resolve();
  }

  static expandConfig(config, configPath) {
    if (!Analyzer.isValidConfig(config)) {
      throw new Error('Invalid configuration');
    }

    // Merge config with defaults
    const defaults = {
      output: path.resolve(configPath, '..', 'hekla.json')
    };
    return Object.assign({}, defaults, config);
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
