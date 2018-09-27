const asyncLib = require('async');
const chalk = require('chalk');
const StickyTerminalDisplay = require('sticky-terminal-display');
const {
  Analyzer,
  ConfigValidator
} = require('hekla-core');

const WORKER_COUNT = 5;
const BAIL_ON_ERROR = false; // for debugging purposes

module.exports = class HeklaWebpackPlugin {
  constructor(config) {
    this.config = config || {};
    this.analyzer = new Analyzer();

    this.foundResources = new Set();

    this.queue = asyncLib.queue(this.resourceWorker.bind(this), WORKER_COUNT);
    this.queue.drain = this.onQueueDrain.bind(this);
    this.queueWorking = true;
    this.queueDrainResolver = null;
    this.queueDrainRejecter = null;
    this.summary = {
      completed: 0,
      errors: 0
    };
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

    compiler.hooks.emit.tapAsync('AnalysisPlugin', this.emit.bind(this));

    compiler.hooks.compilation.tap('AnalysisPlugin', (compilation) => {
      this.analyzer.setInputFileSystem(compilation.inputFileSystem);
      compilation.hooks.succeedModule.tap('AnalysisPlugin', this.succeedModule.bind(this));
    });
  }

  succeedModule(webpackModule) {
    const { resource } = webpackModule;
    if (typeof resource === 'undefined') {
      return;
    }

    const sanitizedResource = resource.replace(/\?.*$/, '');
    const moduleName = this.analyzer.getModuleName(sanitizedResource);

    if (moduleName.match(/node_modules/)) {
      return;
    }

    if (this.config.exclude) {
      for (let excludePattern of this.config.exclude) {
        if (moduleName.match(excludePattern)) {
          return;
        }
      }
    }

    if (this.foundResources.has(sanitizedResource)) {
      return;
    }
    this.foundResources.add(sanitizedResource);

    if (this.foundResources.size === 1) {
      this.setupRenderers();
    }

    this.printSummary();

    this.queue.push(makeTask(moduleName, sanitizedResource));
  }

  emit(compilation, done) {
    let analysis;
    this.waitForQueueDrain()
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

        done();
      })
      .catch(err => {
        console.error('Error waiting for analysis:', err);
        done(err);
      });
  }

  // Worker queue

  resourceWorker(task, done) {
    this.queueWorking = true;
    const { moduleName, resource } = task;

    // Get renderer
    const renderer = this.assignRenderer();
    const rendererId = (this.workerRenderers.indexOf(renderer) + 1);

    // TODO: truncate the moduleName if it is too long for the message to show on a single line
    renderer.write(`  ${chalk.bold(`Worker ${rendererId}`)}: ${moduleName}`);

    let module = this.analyzer.createModule(resource);

    this.analyzer.processModule(module)
      .then(() => {
        this.freeRenderer(renderer);
        this.summary.completed++;
        this.printSummary();
        done();
      })
      .catch(err => {
        if (BAIL_ON_ERROR) {
          console.log(err);
          process.exit(1);
        }
        this.freeRenderer(renderer);
        this.summary.errors++;
        this.printSummary();
        done(err);
      });
  }

  onQueueDrain() {
    this.queueWorking = false;
    if (this.queueDrainResolver) {
      this.queueDrainResolver();
    }
  }

  waitForQueueDrain() {
    if (!this.queueWorking) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.queueDrainResolver = resolve;
      this.queueDrainRejecter = reject;
    });
  }

  // Rendering status updates

  setupRenderers() {
    const display = new StickyTerminalDisplay();

    this.summaryRenderer = display.getLineRenderer();

    this.workerRenderers = [];
    this.workerRendererUsage = new Set();
    for (let i = 0; i < WORKER_COUNT; i++) {
      const renderer = display.getLineRenderer();
      this.workerRenderers.push(renderer);
    }
  }

  printSummary() {
    const { completed, errors } = this.summary;
    const processed = completed + errors;
    const found = this.foundResources.size;
    this.summaryRenderer.write(`HeklaWebpackPlugin: processed ${processed}/${found} modules with ${errors} errors`);
  }

  assignRenderer() {
    let idx = -1;
    for (let i = 0; i < this.workerRenderers.length; i++) {
      if (!this.workerRendererUsage.has(i)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      throw new Error('No free renderers');
    }
    this.workerRendererUsage.add(idx);
    return this.workerRenderers[idx];
  }

  freeRenderer(renderer) {
    let idx = this.workerRenderers.indexOf(renderer);
    if (idx === -1) {
      throw new Error('Unknown renderer');
    }
    this.workerRendererUsage.delete(idx);
  }
}

function makeTask(moduleName, resource) {
  return { moduleName, resource };
}
