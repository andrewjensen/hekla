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

function getComponentDetails(node, module) {
  const filePath = module.path;
  // TODO: it's 1:30am and I'm getting sloppy - clean up this whole flow
  const templatePath = filePath.replace('.js', '.html');
  return getDependencies(templatePath)
    .then(dependencies => {
      const componentName = getName(node);
      return {
        name: componentName,
        altNames: [dashify(componentName)],
        type: 'angular-directive',
        path: filePath,
        templatePath: getTemplate(node),  // TODO: reuse?
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

function getTemplate(directiveCallNode) {
  const templateUrl = getTemplateUrl(directiveCallNode);

  // TODO: handle `template` as well as `templateUrl`

  // TODO: get HTML and parse it

  // TODO: get component dependencies out of the HTML

  // console.log('template:', templateUrl);
  return templateUrl;
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

function getDependencies(templatePath) {
  return utils.getFileContents(templatePath)
    .then(templateContents => htmlParser.getDependencies(templateContents, templatePath))
    .catch(err => {
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
