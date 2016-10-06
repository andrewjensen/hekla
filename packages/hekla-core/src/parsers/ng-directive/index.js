'use strict';

const dashify = require('dashify');
const utils = require('../../utils');
const htmlParser = require('../../analyzer/html-parser');
const BaseParser = require('../base-parser');

module.exports = class AngularDirectiveParser extends BaseParser {
  constructor() {
    super();
  }

  extractComponents(module) {
    return utils.parseAST(module.contents, module.path)
      .then(ast => analyzeAllInFile(ast, module))
      .catch(err => {
        console.error(`Error parsing AST for ${module.path}: `, err.stack);
        return {
          components: [],
          errors: [err]
        };
      });
  }
};

function analyzeAllInFile(ast, module) {
  return Promise.resolve(getDirectiveCallNodes(ast))
    .then(directiveCallNodes => {
      return Promise.all(directiveCallNodes.map(node => getComponentDetails(node, module)));
    })
    .then(components => {
      return {
        components: components,
        errors: []
      };
    })
    .catch(err => {
      return {
        components: [],
        errors: [err]
      };
    });
}

function getDirectiveCallNodes(ast) {
  return utils.getNodesByType(ast.program, 'CallExpression')
    .filter(node => {
      return (node.callee && node.callee.property && node.callee.property.name === 'directive');
    });
}

function getDirectiveDefinitionObject(directiveCallNode) {
  const definitionFunction = directiveCallNode.arguments[1];

  const returnStatement = definitionFunction.body.body
    .reduce((previous, statement) => (statement.type === 'ReturnStatement' ? statement : previous), null);

  const definitionObject = returnStatement.argument;

  return definitionObject;
}

function getDefinitionProperty(propertyName, directiveDefinitionObject) {
  return directiveDefinitionObject.properties
    .reduce((prev, property) => (property.key.type === 'Identifier' && property.key.name === propertyName ? property.value : prev), null);
}

function getComponentDetails(node, module) {
  // TODO: refactor helper functions to use the definition object
  const directiveDefinitionObject = getDirectiveDefinitionObject(node);
  const filePath = module.path;

  let templateInfo = {};
  return getTemplateInfo(directiveDefinitionObject, filePath)
    .then(info => {
      templateInfo = info;
      return info;
    })
    .then(info => getDependencies(info))
    .then(dependencies => {
      const componentName = getName(node);
      return {
        name: componentName,
        altNames: [dashify(componentName)],
        type: 'angular-directive',
        path: filePath,
        templatePath: templateInfo.path,
        properties: {
          angularModule: getModuleName(node),
          scope: getScope(node, filePath)
        },
        dependencies: dependencies
      };
    });
}

function getName(directiveCallNode) {
  const directiveNameNode = directiveCallNode.arguments[0];
  if (directiveNameNode.type === 'StringLiteral') {
    return directiveNameNode.value;
  } else {
    throw new Error('directive name type not handled: ', directiveNameNode.type);
  }
}

function getModuleName(directiveCallNode) {
  if (directiveCallNode.callee.type === 'MemberExpression' &&
      directiveCallNode.callee.object.type === 'CallExpression' &&
      directiveCallNode.callee.object.callee.property.name === 'module') {

    const ngModuleCallNode = directiveCallNode.callee.object;
    return ngModuleCallNode.arguments[0].value;
  } else {
    return null;
  }
}

function getScope(directiveCallNode, filePath) {
  const scopeNodes = utils.getNodesByType(directiveCallNode, 'ObjectProperty')
    .filter(node => (node.key && node.key.name && node.key.name === 'scope'));

  if (scopeNodes.length === 0) {
    return null;
  } else if (scopeNodes.length > 1) {
    // TODO: this can happen with chained module.directive().directive() calls
    throw new Error('Parser bug: multiple scope declarations found', scopeNodes);
  }

  const scopeNode = scopeNodes[0];
  if (scopeNode.value.properties) {
    return scopeNode.value.properties
      .map(property => property.key.name);
  } else if (scopeNode.value.type === 'BooleanLiteral') {
    return scopeNode.value.value;
  } else {
    throw new error('Parser bug while parsing scope value');
  }
}

function getTemplateInfo(directiveDefinitionObject, filePath) {
  const templatePath = filePath.replace('.js', '.html');

  const templateProperty = getDefinitionProperty('template', directiveDefinitionObject);
  const templateUrlProperty = getDefinitionProperty('templateUrl', directiveDefinitionObject);

  // TODO: resolve require()
  // TODO: handle `template` strings
  // TODO: handle `templateUrl`

  return Promise.resolve({
    type: 'inline',
    path: templatePath,
    contents: ''
  });
}

function getInlineTemplateContents() {
  // TODO: implement
  return Promise.resolve('');
}

function getExternalTemplateContents() {
  // TODO: implement
  return utils.getFileContents(templatePath)
}

function getTemplateUrl(directiveCallNode) {
  const templateUrlNodes = utils.getNodesByType(directiveCallNode, 'ObjectProperty')
    .filter(node => (node.key && node.key.name === 'templateUrl'));

  if (templateUrlNodes.length === 0) {
    return null;
  }

  const templateUrlNode = templateUrlNodes[0];
  if (templateUrlNode.value.type === 'StringLiteral') {
    return templateUrlNode.value.value;
  } else {
    throw new Error('Unrecognized directive templateUrl:', templateUrlNode);
  }
}

function getDependencies(templateInfo) {
  console.log('getting dependencies:', templateInfo);
  return Promise.resolve()
    .then(() => htmlParser.getDependencies(templateInfo.contents, templateInfo.path))
    .catch(err => {
      console.log('caught an error!', err);
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
