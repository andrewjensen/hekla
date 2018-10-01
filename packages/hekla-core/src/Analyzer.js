const {
  SyncHook,
  AsyncSeriesHook
} = require('tapable');

const Module = require('./Module');
const {
  parseAST,
  parseHTML,
  ASTWrapper,
  DOMWrapper
} = require('./utils/ast-utils');

module.exports = class Analyzer {
  constructor() {
    this.rootPath = null;
    this.fs = null;
    this.modules = [];
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleJSFamilyAST: new SyncHook(['module', 'ast']),
      moduleHTMLFamilyDOM: new SyncHook(['module', 'dom']),
      reporter: new AsyncSeriesHook(['analyzer', 'analysis'])
    };
  }

  applyConfig(config) {
    this.rootPath = config.rootPath;

    if (config.plugins) {
      for (let plugin of config.plugins) {
        plugin.apply(this);
      }
    }
  }

  setInputFileSystem(fs) {
    this.fs = fs;
  }

  getModuleName(resource) {
    return getModuleName(resource, this.rootPath);
  }

  getAnalysis() {
    const analysis = {
      modules: this.modules.map(module => module.serialize())
    };
    return analysis;
  }

  createModule(resource) {
    const moduleName = this.getModuleName(resource);
    return new Module(moduleName, resource);
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
          this.hooks.moduleJSFamilyAST.call(module, astWrapper);
        });
    } else if (resource.match(/\.html$/)) {
      return parseHTML(contents)
        .then(dom => {
          const domWrapper = new DOMWrapper(dom);
          this.hooks.moduleHTMLFamilyDOM.call(module, domWrapper);
        });
    } else {
      // This file type doesn't support parsing its AST.
      return Promise.resolve();
    }
  }

  processModuleSource(module, source) {
    this.hooks.moduleRawSource.call(module, source);
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

function getModuleName(resource, rootPath) {
  let fullPath = resource;
  if (fullPath.indexOf('!') !== -1) {
    const pieces = resource.split('!');
    fullPath = pieces[pieces.length - 1];
  }
  const projectPath = fullPath.replace(rootPath, '');
  return `.${projectPath}`;
}
