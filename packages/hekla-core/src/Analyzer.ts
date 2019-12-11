import {
  SyncHook,
  AsyncSeriesHook
} from 'tapable';

import Module from './Module';
import WorkQueue from './WorkQueue';
import {
  analysisStarted,
  analysisSuccessful,
  StatusMessage,
} from './StatusMessage';
import {
  IHeklaConfig,
  IAnalysis,
  IAnalyzerHooks,
  IFilesystem,
  IAnalyzer
} from './interfaces';
import {
  getProjectFiles
} from './utils/fs-utils';
import {
  parseAST,
  parseHTML,
  ASTWrapper,
  DOMWrapper
} from './utils/ast-utils';

const DEFAULT_WORKER_COUNT = 5;

export default class Analyzer implements IAnalyzer {
  config: null | IHeklaConfig
  fs: null | IFilesystem
  modules: Module[]
  workQueue: null | WorkQueue
  hooks: IAnalyzerHooks

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

  applyConfig(config: IHeklaConfig) {
    this.config = config;

    if (config.plugins) {
      for (let plugin of config.plugins) {
        plugin.apply(this);
      }
    }
  }

  setInputFileSystem(fs: IFilesystem) {
    this.fs = fs;
  }

  getAnalysis(): IAnalysis {
    const analysis = {
      modules: this.modules.map(module => module.serialize())
    };
    return analysis;
  }

  async run() {
    if (!this.config) {
      throw new Error('Analyzer has not been configured');
    }

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

  startWorkers(workerCount: number) {
    this.workQueue = new WorkQueue(this);
    this.workQueue.onStatusUpdate(message => this.sendStatusUpdate(message));

    this.workQueue.start(workerCount);
    this.sendStatusUpdate(analysisStarted(DEFAULT_WORKER_COUNT));
  }

  async waitForWorkers() {
    if (!this.workQueue) {
      throw new Error('Analyzer has not been started');
    }

    await this.workQueue.waitForFinish();
    this.sendStatusUpdate(analysisSuccessful());
  }

  createModule(resource: string): Module {
    if (!this.config) {
      throw new Error('Analyzer has not been configured');
    }

    return new Module(resource, this.config.rootPath);
  }

  queueProcessModule(module: Module) {
    if (!this.workQueue) {
      throw new Error('Analyzer has not been started');
    }

    this.workQueue.enqueue(module);
  }

  processModule(module: Module) {
    if (!this.fs) {
      throw new Error('Filesystem has not been defined');
    }

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

  processModuleSyntaxTree(module: Module, contents: string) {
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

  processModuleSource(module: Module, source: string) {
    this.hooks.moduleRawSource.call(module, source);
  }

  sendStatusUpdate(message: StatusMessage) {
    this.hooks.statusUpdate.call(message);
  }

  processReporters(analysis: IAnalysis) {
    return this.hooks.reporter.promise(this, analysis);
  }
}

// TODO: make async?
function readFile(fs: IFilesystem, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const contents = (buffer as Buffer).toString('utf-8');
        resolve(contents);
      }
    });
  });
}
