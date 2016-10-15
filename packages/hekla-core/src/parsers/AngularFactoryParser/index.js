'use strict';

const path = require('path');
const utils = require('../../utils');
const BaseParser = require('../BaseParser');
const ParserResult = require('../../utils/parser-result');

module.exports = class AngularFactoryParser extends BaseParser {
  constructor() {
    super();
  }

  extractComponents(module) {
    return utils.parseAST(module.contents, module.path)
      .then(ast => analyzeAllInFile(ast, module))
      .catch(err => {
        console.error(`Error parsing AST for ${module.path}: `, err.stack);
        return ParserResult.create([], err, module);
      });
  }
};

// TODO: refactor the copy pasta into shared Angular utilities

function analyzeAllInFile(ast, module) {
  return Promise.resolve(getFactoryCallNodes(ast))
    .then(factoryCallNodes => {
      return Promise.all(factoryCallNodes.map(node => getComponentDetails(node, module, ast)));
    })
    .then(components => ParserResult.create(components))
    .catch(err => ParserResult.create([], err, module));
}

function getFactoryCallNodes(ast) {
  return utils.getNodesByType(ast.program, 'CallExpression')
    .filter(node => {
      return (node.callee && node.callee.property && node.callee.property.name === 'factory');
    });
}

function getComponentDetails(callNode, module, ast) {
  const definitionFunction = getDefinitionFunction(callNode, ast);
  return {
    name: getName(callNode),
    type: 'angular-factory',
    path: '',
    properties: {
      angularModule: getModuleName(callNode)
    },
    dependencies: getDependencies(definitionFunction)
  };
}

function getName(callNode) {
  const factoryNameNode = callNode.arguments[0];
  if (factoryNameNode.type === 'StringLiteral') {
    return factoryNameNode.value;
  } else {
    throw new Error('factory name type not handled: ', factoryNameNode.type);
  }
}

function getModuleName(callNode) {
  if (callNode.callee.type === 'MemberExpression' &&
      callNode.callee.object.type === 'CallExpression' &&
      callNode.callee.object.callee.property.name === 'module') {

    const ngModuleCallNode = callNode.callee.object;
    return ngModuleCallNode.arguments[0].value;
  } else {
    return null;
  }
}

function getDefinitionFunction(callNode, ast) {
  const secondArg = callNode.arguments[1];

  let possibleDefinitionFunction;

  if (secondArg.type === 'Identifier') {
    // Function is saved in a variable - resolve it
    const declarations = utils.getVariableDeclarationsByName(ast, secondArg.name);
    if (declarations.length === 1) {
      possibleDefinitionFunction = declarations[0];
    } else {
      throw new Error(`Cannot resolve template from variable: ${variableName}`);
    }
  } else {
    possibleDefinitionFunction = secondArg;
  }

  // We may have found the function, but we may have found a DI array.
  // Reduce it.
  let definitionFunction;

  if (possibleDefinitionFunction.type === 'ArrayExpression' &&
      possibleDefinitionFunction.elements[possibleDefinitionFunction.elements.length - 1].type === 'FunctionExpression'
  ) {
    // Angular DI syntax
    return possibleDefinitionFunction.elements[possibleDefinitionFunction.elements.length - 1];
  } else if (possibleDefinitionFunction.type === 'FunctionExpression') {
    // Standard function
    return possibleDefinitionFunction;
  } else {
    throw new Error('Cannot find definition function');
  }
}

function getDependencies(definitionFunction) {
  if (definitionFunction) {
    return definitionFunction.params.map(p => p.name);
  } else {
    return [];
  }
}
