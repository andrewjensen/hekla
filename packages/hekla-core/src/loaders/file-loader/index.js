'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
// const babylon = require('babylon');

const BaseLoader = require('../base-loader');
// const utils = require('./utils');
// const backboneView = require('./js-components/backbone-view');
// const ngDirective = require('./js-components/ng-directive');

module.exports = class FileLoader extends BaseLoader {
  constructor(config) {
    super();
    console.log('new FileLoader');
    this.config = config;
  }

  loadFiles() {
    return analyzePath(this.config.rootPath);
  }
};

function analyzePath(rootPath) {
  console.log(`Loading files in ${rootPath}...`);
  return getFileTree(rootPath)
    // .then(files => {
    //   console.log(`Analyzing ${files.length} Javascript files...`);
    //   return analyzeFiles(files, rootPath);
    // })
    // .then(results => {
    //   console.log('Finished!');
    //   console.log('\ttotal components:', results.components.length);
    //   console.log('\ttotal errors:', results.errors.length);
    //   console.log(results.errors.map(error => error.message).join('\n'));
    //   return results;
    // })
    // .catch(err => {
    //   console.error('Uncaught error during analysis:', err.stack);
    // });
}

function getFileTree(rootPath) {
  return new Promise((resolve, reject) => {
    const options = {
      cwd: rootPath,
      ignore: [
        '**/node_modules/**',
        '**/bower_components/**',
        '**/vendor/**'
      ]
    };
    glob('**/*.js', options, (err, files) => {
      if (err) return reject(err);

      resolve(files);
    });
  });
}

// TODO: move the following code into the Analyzer

// /**
//  * @return {Promise<AnalysisResult>}
//  */
// function analyzeFiles(files, rootPath) {
//   return Promise.all(files.map(file => analyzeFile(file, rootPath)))
//     .then(analysisResultArray => mergeAnalysisResults(analysisResultArray));
// }
//
// /**
//  * @return {Promise<AnalysisResult>}
//  */
// function analyzeFile(file, rootPath) {
//   // console.log('analyzeFile', file);
//   const filePath = path.resolve(rootPath, file);
//
//   return utils.getFileContents(filePath)
//     .then(contents => {
//       return parseAST(contents, filePath);
//     })
//     .catch(err => ({
//       components: [],
//       errors: [err]
//     }))
//     .then(ast => {
//       return Promise.all([
//         // Add more types of components here!
//         backboneView.analyzeAllInFile(ast, filePath, rootPath),
//         ngDirective.analyzeAllInFile(ast, filePath, rootPath)
//       ]);
//     })
//     .then(analysisResultArray => mergeAnalysisResults(analysisResultArray))
//     .catch(err => {
//       console.log('Error while analyzing file:', filePath);
//       console.log(err);
//       console.log();
//       return [];
//     });
// }
//
// function parseAST(fileContents, filePath) {
//   try {
//     const ast = babylon.parse(fileContents, {
//       sourceType: 'module'
//     });
//     return Promise.resolve(ast);
//   } catch (err) {
//     console.error(`Error parsing ${filePath}: `, err);
//     return Promise.reject(err);
//   }
// }
//
// function mergeAnalysisResults(analysisResultArray) {
//   return {
//     components: mergeArrays(analysisResultArray.map(result => result.components)),
//     errors: mergeArrays(analysisResultArray.map(result => result.errors))
//   };
// }
//
// function mergeArrays(arrays) {
//   return [].concat.apply([], arrays);
// }