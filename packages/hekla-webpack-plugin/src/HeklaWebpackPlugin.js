const asyncLib = require('async');
const chalk = require('chalk');
const StickyTerminalDisplay = require('sticky-terminal-display');

const WORKER_COUNT = 5;

module.exports = class HeklaWebpackPlugin {
  constructor() {
    this.rootPath = null;
    this.results = [];
    this.foundResources = new Set();
    this.inputFileSystem = null;

    this.queue = asyncLib.queue(this.resourceWorker.bind(this), WORKER_COUNT);
    this.queue.drain = this.onQueueDrain.bind(this);
    this.queueWorking = true;
    this.queueDrainResolver = null;
    this.queueDrainRejecter = null;
  }

  // Webpack lifecycle hooks

  apply(compiler) {
    this.rootPath = compiler.context;

    compiler.hooks.emit.tapAsync('AnalysisPlugin', this.emit.bind(this));

    compiler.hooks.compilation.tap('AnalysisPlugin', (compilation) => {
      this.inputFileSystem = compilation.inputFileSystem;
      compilation.hooks.succeedModule.tap('AnalysisPlugin', this.succeedModule.bind(this));
    });
  }

  succeedModule(webpackModule) {
    const { resource } = webpackModule;
    if (typeof resource === 'undefined') {
      return;
    }

    const sanitizedResource = resource.replace(/\?.*$/, '');
    const moduleName = getModuleName(sanitizedResource, this.rootPath);

    if (moduleName.match(/node_modules/)) {
      return;
    }

    if (this.foundResources.has(sanitizedResource)) {
      return;
    }
    this.foundResources.add(sanitizedResource);

    if (this.foundResources.size === 1) {
      this.setupRenderers();
    }

    this.queue.push(makeTask(moduleName, sanitizedResource));
  }

  emit(compilation, done) {
    this.waitForQueueDrain()
      .then(() => {
        const analysisFile = JSON.stringify(this.results, null, 2);

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
    renderer.write(`${chalk.bold(`Worker ${rendererId}`)}: ${moduleName}`);

    readFile(this.inputFileSystem, resource)
      .then(contents => {
        const lines = contents.split('\n').length;
        this.results.push(makeResult(moduleName, lines));
        this.freeRenderer(renderer);
        done();
      })
      .catch(err => {
        console.error('Unable to read file!!!', resource);
        this.freeRenderer(renderer);
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
    this.workerRenderers = [];
    this.workerRendererUsage = new Set();
    const display = new StickyTerminalDisplay();
    for (let i = 0; i < WORKER_COUNT; i++) {
      const renderer = display.getLineRenderer();
      this.workerRenderers.push(renderer);
    }
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

function makeResult(moduleName, lines) {
  return { name: moduleName, lines };
}

function getModuleName(resource, rootPath) {
  let fullPath = resource;
  if (fullPath.indexOf('!') !== -1) {
    const pieces = resource.split('!');
    fullPath = pieces[pieces.length - 1];
  }
  const projectPath = fullPath.replace(rootPath, '');
  return `.${projectPath}`;
}

function readFile(fs, filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const contents = buffer.toString('utf-8');
        resolve(contents);
      }
    });
  });
}
