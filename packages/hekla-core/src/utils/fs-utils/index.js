'use strict';

const fs = require('fs');
const path = require('path');
const camelCase = require('camel-case');

module.exports = {
  getFileExists,
  getFileContents,
  writeJSON,
  getSmartModuleName
};

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

function getSmartModuleName(filePath) {
  const pathPieces = filePath.split('/');
  const filename = pathPieces[pathPieces.length - 1];
  const directory = _maybeCamelCase(pathPieces[pathPieces.length - 2]);

  const filePieces = filename.split('.');
  const filenameNoExt = _maybeCamelCase(filePieces[0]);

  if (filenameNoExt === 'index') {
    return directory;
  } else if (filenameNoExt === 'app') {
    return directory + 'App';
  } else {
    return filenameNoExt;
  }
}

function _maybeCamelCase(name) {
  if (name.indexOf('-')) {
    return camelCase(name);
  } else {
    return name;
  }
}
