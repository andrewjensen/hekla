'use strict';

const path = require('path');
const astUtils = require('../../utils/ast-utils');
const ngUtils = require('../../utils/ng-utils');
const BaseParser = require('../BaseParser');
const ParserResult = require('../../utils/parser-result');

module.exports = class AngularFactoryParser extends BaseParser {
  constructor() {
    super();
  }

  extractComponents(module) {
    return astUtils.parseAST(module.contents, module.path)
      .then(ast => analyzeAllInFile(ast, module))
      .catch(err => {
        console.error(`Error parsing AST for ${module.path}: `, err.stack);
        return ParserResult.create([], err, module);
      });
  }
};

function analyzeAllInFile(ast, module) {
  return Promise.resolve(getFactoryCallNodes(ast))
    .then(factoryCallNodes => {
      return Promise.all(factoryCallNodes.map(node => getComponentDetails(node, module, ast)));
    })
    .then(components => ParserResult.create(components))
    .catch(err => ParserResult.create([], err, module));
}

function getFactoryCallNodes(ast) {
  return astUtils
    .getNodesByType(ast.program, 'CallExpression')
    .filter(node => (astUtils.getDeepProperty(node, 'callee.property.name') === 'factory'));
}

function getComponentDetails(callNode, module, ast) {
  const definitionFunction = ngUtils.getDefinitionFunction(callNode, ast);
  return {
    name: ngUtils.getName(callNode),
    type: 'angular-factory',
    path: '',
    properties: {
      angularModule: ngUtils.getModuleName(callNode)
    },
    dependencies: getDependencies(definitionFunction)
  };
}

function getDependencies(definitionFunction) {
  if (definitionFunction) {
    return definitionFunction.params.map(p => p.name);
  } else {
    return [];
  }
}
