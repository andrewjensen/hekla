'use strict';

const path = require('path');
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
    name: fsUtils.getSmartModuleName(module.path),
    type: 'default',
    path: module.path,
    dependencies: getDependencies(ast)
  };
}

function getDependencies(ast) {
  return astUtils.getImportInfo(ast)
    .map(importItem => importItem.value);
}
