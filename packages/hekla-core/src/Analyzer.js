const { SyncHook } = require('tapable');

const Module = require('./Module');
const {
  parseAST
} = require('./utils/ast-utils');

module.exports = class Analyzer {
  constructor() {
    this.rootPath = null;
    this.fs = null;
    this.modules = [];
    this.hooks = {
      moduleRawSource: new SyncHook(['module', 'source']),
      moduleJSFamilyAST: new SyncHook(['module', 'ast'])
    };
  }

  setRootPath(rootPath) {
    this.rootPath = rootPath;
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

function getModuleName(resource, rootPath) {
  let fullPath = resource;
  if (fullPath.indexOf('!') !== -1) {
    const pieces = resource.split('!');
    fullPath = pieces[pieces.length - 1];
  }
  const projectPath = fullPath.replace(rootPath, '');
  return `.${projectPath}`;
}
