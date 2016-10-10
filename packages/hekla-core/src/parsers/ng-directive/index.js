'use strict';

const path = require('path');
const dashify = require('dashify');
const utils = require('../../utils');
const htmlParser = require('../../analyzer/html-parser');
const BaseParser = require('../base-parser');
const ParserResult = require('../../utils/parser-result');

module.exports = class AngularDirectiveParser extends BaseParser {
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

function analyzeAllInFile(ast, module) {
  return Promise.resolve(getDirectiveCallNodes(ast))
    .then(directiveCallNodes => {
      return Promise.all(directiveCallNodes.map(node => getComponentDetails(node, module)));
    })
    .then(components => {
      return ParserResult.create(components);
    })
    .catch(err => {
      console.log('error in analyzeAllInFile:', err.message);
      try {
        return ParserResult.create([], err, module);
      } catch (otherError) {
        console.log('caught an extra error!', otherError);
      }
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
          scope: getScope(directiveDefinitionObject)
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

function getScope(directiveDefinitionObject) {
  const scopeNode = getDefinitionProperty('scope', directiveDefinitionObject);

  if (scopeNode.properties) {
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

function getTemplateInfo(directiveDefinitionObject, filePath) {
  const templateProperty = getDefinitionProperty('template', directiveDefinitionObject);
  const templateUrlProperty = getDefinitionProperty('templateUrl', directiveDefinitionObject);

  if (templateProperty && templateProperty.type === 'CallExpression' && templateProperty.callee.name === 'require') {
    // Required template file
    const requiredPath = templateProperty.arguments[0].value;
    const templatePath = path.resolve(filePath, '..', requiredPath);
    return getExternalTemplateContents(templatePath)
      .then(contents => {
        return {
          type: 'external',
          path: templatePath,
          contents
        };
      });
  } else if (templateProperty && templateProperty.type === 'StringLiteral') {
    // Simple inline template
    return Promise.resolve({
      type: 'inline',
      path: null,
      contents: templateProperty.value
    });
  } else if (templateProperty) {
    // Complex inline template
    return Promise.resolve({
      type: 'inline',
      path: null,
      contents: reduceComplexTemplate(templateProperty)
    });
  } else if (templateUrlProperty && templateUrlProperty.type === 'StringLiteral') {
    // templateUrl string
    return resolveTemplatePath(templateUrlProperty.value, filePath)
      .then(templatePath => {
        if (templatePath) {
          return getExternalTemplateContents(templatePath)
            .then(contents => ({
              type: 'external',
              path: templatePath,
              contents
            }));
        } else {
          return Promise.resolve({
            type: 'external',
            path: null,
            contents: ''
          });
        }
      });
  } else if (templateUrlProperty) {
    // Weird templateUrl - can't parse
    return Promise.resolve({
      type: 'external',
      path: null,
      contents: ''
    });
  } else {
    // No template or templateUrl
    return Promise.resolve(null);
  }
}

function reduceComplexTemplate(templateProperty) {
  if (templateProperty.type === 'BinaryExpression') {
    return reduceConcatenatedTemplate(templateProperty);
  } else if (templateProperty.type === 'CallExpression') {
    return reduceArrayJoinTemplate(templateProperty);
    return '';
  } else {
    throw new Error('invalid complex template');
  }
}

function reduceConcatenatedTemplate(binaryExpression) {
  const leftSide = (binaryExpression.left.type === 'BinaryExpression' ? reduceConcatenatedTemplate(binaryExpression.left) : binaryExpression.left.value);
  const rightSide = binaryExpression.right.value;
  return leftSide + rightSide;
}

function reduceArrayJoinTemplate(joinCallExpression) {
  const templateArray = joinCallExpression.callee.object;
  const pieces = templateArray.elements.map(element => element.value);
  const delimiter = joinCallExpression.arguments[0].value;
  return pieces.join(delimiter);
}

/**
 * Attempt to convert a templateUrl into an absolute path
 */
function resolveTemplatePath(templateUrl, componentPath) {
  const componentFilename = getFileName(componentPath);
  const templateFilename = getFileName(templateUrl);

  if (getDirectoryName(templateUrl) === getDirectoryName(componentPath)) {
    const templatePath = componentPath.replace(componentFilename, templateFilename);
    return utils.getFileExists(templatePath)
      .then(fileExists => {
        if (fileExists) {
          // The template is in the same directory as the component.
          return templatePath;
        } else {
          // TODO: the file is missing so the naive replace didn't work...
          return null;
        }
      });
  } else {
    // The template is in a different directory...
    // TODO: do tricky stuff here to reconcile the path and url.
    return Promise.resolve(null);
  }
}

function getDirectoryName(path) {
  const pieces = path.split('/');
  return pieces[pieces.length - 2];
}

function getFileName(path) {
  const pieces = path.split('/');
  return pieces[pieces.length - 1];
}

function getExternalTemplateContents(templatePath) {
  return utils.getFileContents(templatePath)
}

function getDependencies(templateInfo) {
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
