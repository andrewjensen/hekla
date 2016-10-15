'use strict';

const path = require('path');

const astUtils = require('../../utils/ast-utils');
const fsUtils = require('../../utils/fs-utils');
const ngUtils = require('../../utils/ng-utils');
const htmlParser = require('../../analyzer/html-parser');
const BaseParser = require('../BaseParser');
const ParserResult = require('../../utils/parser-result');

module.exports = class AngularDirectiveParser extends BaseParser {
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
  return Promise.resolve(getDirectiveCallNodes(ast))
    .then(directiveCallNodes => {
      return Promise.all(directiveCallNodes.map(node => getComponentDetails(node, module, ast)));
    })
    .then(components => ParserResult.create(components))
    .catch(err => ParserResult.create([], err, module));
}

function getDirectiveCallNodes(ast) {
  return astUtils
    .getNodesByType(ast.program, 'CallExpression')
    .filter(node => (astUtils.getDeepProperty(node, 'callee.property.name') === 'directive'));
}

function getDirectiveDefinitionObject(directiveCallNode, ast) {

  const definitionFunction = ngUtils.getDefinitionFunction(directiveCallNode, ast);

  const returnStatement = definitionFunction.body.body
    .reduce((previous, statement) => (statement.type === 'ReturnStatement' ? statement : previous), null);

  if (returnStatement.argument.type === 'ObjectExpression') {
    const definitionObject = returnStatement.argument;
    return definitionObject;
  } else if (returnStatement.argument.type === 'FunctionExpression') {
    // This is just a link function, not a whole definition object.
    return null;
  } else {
    throw new Error('Cannot find directive definition object');
  }
}

function getDefinitionProperty(propertyName, directiveDefinitionObject) {
  if (!directiveDefinitionObject) {
    return null;
  }

  return directiveDefinitionObject.properties
    .reduce((prev, property) => (property.key.type === 'Identifier' && property.key.name === propertyName ? property.value : prev), null);
}

function getComponentDetails(node, module, ast) {
  const directiveDefinitionObject = getDirectiveDefinitionObject(node, ast);
  const filePath = module.path;

  let templateInfo = {};
  return getTemplateInfo(directiveDefinitionObject, filePath, ast)
    .then(info => {
      templateInfo = info;
      return info;
    })
    .then(info => getDependencies(info))
    .then(dependencies => {
      const componentName = ngUtils.getName(node);
      const kebabCaseName = ngUtils.getKebabCaseName(componentName);
      return {
        name: componentName,
        altNames: (kebabCaseName.indexOf('-') === -1 ? [] : [kebabCaseName]),
        type: 'angular-directive',
        path: filePath,
        templatePath: (templateInfo ? templateInfo.path : null),
        properties: {
          angularModule: ngUtils.getModuleName(node),
          scope: getScope(directiveDefinitionObject)
        },
        dependencies: dependencies
      };
    });
}

function getScope(directiveDefinitionObject) {
  const scopeNode = getDefinitionProperty('scope', directiveDefinitionObject);

  if (!scopeNode) {
    return null;
  } else if (scopeNode.properties) {
    return scopeNode.properties
      .map(property => getScopeParam(property));
  } else if (scopeNode.type === 'BooleanLiteral') {
    return scopeNode.value;
  } else {
    throw new error('Parser bug while parsing scope value');
  }
}

function getScopeParam(propertyObject) {
  if (propertyObject.key.type === 'Identifier') return propertyObject.key.name;
  else if (propertyObject.key.type === 'StringLiteral') return propertyObject.key.value;
  else throw new Error('invalid node type for scope parameter: ' + propertyObject.key.type);
}

function getTemplateInfo(directiveDefinitionObject, filePath, ast) {
  const templateProperty = getDefinitionProperty('template', directiveDefinitionObject);
  const templateUrlProperty = getDefinitionProperty('templateUrl', directiveDefinitionObject);

  return ngUtils.getTemplateInfo(templateProperty, templateUrlProperty, filePath, ast);
}

function getDependencies(templateInfo) {
  if (!templateInfo) {
    return Promise.resolve([]);
  }

  // console.log('getting dependencies:', templateInfo);
  return Promise.resolve()
    .then(() => htmlParser.getDependencies(templateInfo.contents, templateInfo.path))
    .catch(err => {
      console.log('dependency error!', err);
      if (err.code === 'ENOENT') {
        // console.log('    template does not exist, bro');
        return [];
      } else {
        return Promise.reject(err);
      }
    });
}

function debugNode(node) {
  // TODO: remove this function
  console.log(JSON.stringify(node, null, 2));
}
