const { SyncHook } = require('tapable');

const Module = require('./Module');
const {
  parseAST
} = require('./utils/ast-utils');

module.exports = class Analyzer {
  constructor() {
    this.fs = null;
    this.modules = [];
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleJSFamilyAST: new SyncHook(['module', 'ast'])
    };
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

  createModule(moduleName, resource) {
    return new Module(moduleName, resource);
  }

  processModule(module) {
    const resource = module.getResource();
    return readFile(this.fs, resource)
      .then(contents => {
        this.processModuleSource(module, contents);

        if (resource.match(/\.[jt]sx?$/)) {
          return parseAST(contents)
            .then(ast => {
              this.processJSModuleAST(module, ast);
            });
        } else {
          return Promise.resolve();
        }
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

  processModuleSource(module, source) {
    this.hooks.moduleRawSource.call(module, source);
  }

  processJSModuleAST(module, ast) {
    this.hooks.moduleJSFamilyAST.call(module, ast);
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
