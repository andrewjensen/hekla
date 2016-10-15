'use strict';

const path = require('path');
const glob = require('glob');

const BaseLoader = require('../BaseLoader');
const utils = require('../../utils');

module.exports = class FileLoader extends BaseLoader {

  /**
   * config shape:
   * {
   *   root: String,
   *   glob: String,
   *   ignore: String[],
   *   filter?: String => boolean
   * }
   */
  constructor(config) {
    super();
    this.config = config;
  }

  loadModules() {
    return getFileTree(this.config.root, this.config.glob, this.config.ignore)
      .then(files => filterFiles(files, this.config.filter))
      .then(files => expandModules(files, this.config.root));
  }
};

function getFileTree(rootPath, globPattern, ignorePatterns) {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: rootPath,
      ignore: ignorePatterns,
      absolute: true
    };
    glob(globPattern, options, (err, files) => {
      if (err) return reject(err);

      resolve(files);
    });
  });
}

function filterFiles(files, filterFn) {
  if (typeof filterFn === 'function') {
    return files.filter(filterFn);
  } else {
    return files;
  }
}

function expandModules(files, rootPath) {
  const modules = files.map(file => ({
    path: file
  }));

  return Promise.all(modules.map(module => getModuleSource(module, rootPath)))
}

function getModuleSource(module, rootPath) {
  const filePath = path.resolve(rootPath, module.path);
  return utils.getFileContents(filePath)
    .then(contents => {
      return Object.assign({}, module, {
        contents: contents
      });
    });
}
