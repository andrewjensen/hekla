'use strict';

const path = require('path');
const camelCase = require('camel-case');

const astUtils = require('../../../utils/ast-utils');
const fsUtils = require('../../../utils/fs-utils');
const BaseParser = require('../BaseParser');
const ParserResult = require('../../../utils/parser-result');

module.exports = class DefaultParser extends BaseParser {
  constructor() {
    super();
  }

  extractComponents(module) {
    return astUtils.parseAST(module.contents, module.path)
      .then(ast => analyzeDefaultComponent(ast, module))
      .catch(err => {
        console.error(`Error parsing AST for ${module.path}: `, err.stack);
        return ParserResult.create([], err, module);
      });
  }
};

function analyzeDefaultComponent(ast, module) {
  return Promise.resolve(getComponentDetails(module, ast))
    .then(component => ParserResult.create([component]))
    .catch(err => ParserResult.create([], err, module));
}

function getComponentDetails(module, ast) {
  return {
    name: getSmartModuleName(module.path),
    type: 'default',
    path: module.path,
    dependencies: getDependencies(ast)
  };
}

function getDependencies(ast) {
  return astUtils.getImportInfo(ast)
    .map(importItem => importItem.value);
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
