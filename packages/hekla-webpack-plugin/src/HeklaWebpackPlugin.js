const minimatch = require('minimatch');
const {
  Analyzer,
  ConfigValidator,
  Module
} = require('hekla-core');
const { getModuleName } = require('hekla-core').fsUtils;

const WORKER_COUNT = 5;

module.exports = class HeklaWebpackPlugin {
  constructor(config) {
    this.config = config || {};
    this.analyzer = new Analyzer();

    this.foundResources = new Set();
  }

  // Webpack lifecycle hooks

  apply(compiler) {
    const validator = new ConfigValidator();
    validator.validate(this.config);
    if (!validator.isValid()) {
      console.log('Invalid Hekla configuration:');
      for (let error of validator.getErrors()) {
        console.log(`  ${error}`);
      }
      console.log();
      throw new Error('Invalid Hekla configuration');
    }

    this.analyzer.applyConfig(this.config);
    this.analyzer.startWorkers(WORKER_COUNT);

    if (compiler.hooks) {
      // Webpack 4+
      compiler.hooks.emit.tapPromise('AnalysisPlugin', this.emit.bind(this));

      compiler.hooks.compilation.tap('AnalysisPlugin', (compilation) => {
        this.analyzer.setInputFileSystem(compilation.inputFileSystem);
        compilation.hooks.succeedModule.tap('AnalysisPlugin', this.succeedModule.bind(this));
      });
    } else {
      // Webpack 3
      compiler.plugin('emit', this.emit.bind(this));

      compiler.plugin('compilation', (compilation) => {
        this.analyzer.setInputFileSystem(compilation.inputFileSystem);
        compilation.plugin('succeed-module', this.succeedModule.bind(this));
      });
    }
  }

  succeedModule(webpackModule) {
    const { resource } = webpackModule;
    if (typeof resource === 'undefined') {
      return;
    }

    const sanitizedResource = resource.replace(/\?.*$/, '');
    const moduleName = getModuleName(sanitizedResource, this.analyzer.config.rootPath);

    if (moduleName.match(/node_modules/)) {
      return;
    }

    if (this.config.exclude) {
      for (let excludePattern of this.config.exclude) {
        if (minimatch(moduleName, excludePattern)) {
          return;
        }
      }
    }

    if (this.foundResources.has(sanitizedResource)) {
      return;
    }
    this.foundResources.add(sanitizedResource);

    const fileModule = new Module(sanitizedResource, this.analyzer.config.rootPath);
    this.analyzer.queueProcessModule(fileModule);
  }

  emit(compilation) {
    let analysis;
    return this.analyzer.waitForWorkers()
      .then(() => {
        analysis = this.analyzer.getAnalysis();
        return this.analyzer.processReporters(analysis);
      })
      .then(() => {
        const analysisFile = JSON.stringify(analysis, null, 2);

        compilation.assets['analysis.json'] = {
          source: function() {
            return analysisFile;
          },
          size: function() {
            return analysisFile.length;
          }
        };
      })
      .catch(err => {
        console.error('Error waiting for analysis:', err);
        throw err;
      });
  }
}
