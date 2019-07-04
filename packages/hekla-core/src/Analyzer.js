const {
  SyncHook,
  AsyncSeriesHook
} = require('tapable');

const Module = require('./Module');
const WorkQueue = require('./WorkQueue');
const {
  analysisStarted,
  analysisSuccessful,
} = require('./StatusMessage');
const {
  getProjectFiles
} = require('./utils/fs-utils');
const {
  parseAST,
  parseHTML,
  ASTWrapper,
  DOMWrapper
} = require('./utils/ast-utils');

const DEFAULT_WORKER_COUNT = 5;

module.exports = class Analyzer {
  constructor() {
    this.config = null;
    this.fs = null;
    this.modules = [];
    this.workQueue = null;
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleSyntaxTreeJS: new SyncHook(['module', 'ast']),
      moduleSyntaxTreeHTML: new SyncHook(['module', 'dom']),
      statusUpdate: new SyncHook(['message']),
      reporter: new AsyncSeriesHook(['analyzer', 'analysis'])
    };
  }

  applyConfig(config) {
    this.config = config;

    if (config.plugins) {
      for (let plugin of config.plugins) {
        plugin.apply(this);
      }
    }
  }

  setInputFileSystem(fs) {
    this.fs = fs;
  }

  getAnalysis() {
    const analysis = {
      modules: this.modules.map(module => module.serialize())
    };
    return analysis;
  }

  async run() {
    this.startWorkers(DEFAULT_WORKER_COUNT);

    const files = await getProjectFiles(this.config.rootPath, {
      ignorePatterns: this.config.exclude || []
    });

    for (let file of files) {
      const fileModule = this.createModule(file);
      this.queueProcessModule(fileModule);
    }

    await this.waitForWorkers();
  }

  startWorkers(workerCount) {
    this.workQueue = new WorkQueue(this);
    this.workQueue.onStatusUpdate(message => this.sendStatusUpdate(message));

    this.workQueue.start(workerCount);
    this.sendStatusUpdate(analysisStarted(DEFAULT_WORKER_COUNT));
  }

  async waitForWorkers() {
    await this.workQueue.waitForFinish();
    this.sendStatusUpdate(analysisSuccessful());
  }

  createModule(resource) {
    return new Module(resource, this.config.rootPath);
  }

  queueProcessModule(module) {
    this.workQueue.enqueue(module.getName(), module.getResource());
  }

  processModule(module) {
    const resource = module.getResource();
    return readFile(this.fs, resource)
      .then(contents => {
        this.processModuleSource(module, contents);
        return this.processModuleSyntaxTree(module, contents);
      })
      .then(() => {
        this.modules.push(module);
      })
      .catch(err => {
        module.setError(err);
        this.modules.push(module);
        throw err;
      });
  }

  processModuleSyntaxTree(module, contents) {
    const resource = module.getResource();
    if (resource.match(/\.[jt]sx?$/)) {
      return parseAST(contents)
        .then(ast => {
          const astWrapper = new ASTWrapper(ast);
          this.hooks.moduleSyntaxTreeJS.call(module, astWrapper);
        });
    } else if (resource.match(/\.html$/)) {
      return parseHTML(contents)
        .then(dom => {
          const domWrapper = new DOMWrapper(dom);
          this.hooks.moduleSyntaxTreeHTML.call(module, domWrapper);
        });
    } else {
      // This file type doesn't support parsing its AST.
      return Promise.resolve();
    }
  }

  processModuleSource(module, source) {
    this.hooks.moduleRawSource.call(module, source);
  }

  sendStatusUpdate(message) {
    this.hooks.statusUpdate.call(message);
  }

  processReporters(analysis) {
    return this.hooks.reporter.promise(this, analysis);
  }
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
