'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  getFileExists,
  getFileContents,
  writeJSON
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
