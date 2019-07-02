const fs = require('fs');
const glob = require('glob');

module.exports = {
  getProjectFiles,
  getFileExists,
  getFileContents,
  writeJSON,
  getModuleName,
  getModuleShortName
};

const defaultOptions = {
  ignorePatterns: [],
  globPattern: '**'
};
function getProjectFiles(rootPath, options) {
  const combinedOptions = { ...defaultOptions, ...options };
  return new Promise((resolve, reject) => {
    const globOptions = {
      cwd: rootPath,
      ignore: combinedOptions.ignorePatterns,
      absolute: true,
      nodir: true
    };
    glob(combinedOptions.globPattern, globOptions, (err, files) => {
      if (err) return reject(err);

      resolve(files);
    });
  });
}


function getFileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) return reject(err);

      resolve(stats.isFile());
    });
  });
}

function getFileContents(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, contents) => {
      if (err) return reject(err);

      resolve(contents);
    });
  });
}

function writeJSON(data, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);

      resolve();
    });
  })
}

function getModuleName(resource, rootPath) {
  if (!rootPath) {
    throw new Error('rootPath not specified');
  }
  let fullPath = resource;
  if (fullPath.indexOf('!') !== -1) {
    const pieces = resource.split('!');
    fullPath = pieces[pieces.length - 1];
  }
  const projectPath = fullPath.replace(rootPath, '');
  return `.${projectPath}`;
}

function getModuleShortName(moduleName) {
  const pathPieces = moduleName.split('/');
  const filename = pathPieces[pathPieces.length - 1];
  const directory = pathPieces[pathPieces.length - 2];

  const filePieces = filename.split('.');
  const filenameNoExt = filePieces[0];

  if (['index', 'app'].includes(filenameNoExt)) {
    return `${directory}/${filename}`;
  } else {
    return filename;
  }
}
