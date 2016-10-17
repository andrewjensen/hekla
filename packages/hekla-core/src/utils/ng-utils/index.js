'use strict';

const dashify = require('dashify');

const astUtils = require('../ast-utils');
const fsUtils = require('../fs-utils');

module.exports = {
  getName,
  getKebabCaseName,
  getModuleName,
  getDefinitionFunction,
  getTemplateInfo
};

// Info from definition call
// e.g. angular.module('app').directive('myThing', () => {});

function getName(callNode) {
  const nameNode = callNode.arguments[0];
  if (nameNode.type === 'StringLiteral') {
    return nameNode.value;
  } else {
    throw new Error('Name type not handled: ', nameNode.type);
  }
}

function getKebabCaseName(camelCaseName) {
  return dashify(camelCaseName);
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

// Injection functions

function getDefinitionFunction(callNode, ast) {
  const secondArg = callNode.arguments[1];

  let possibleDefinitionFunction;

  if (secondArg.type === 'Identifier') {
    // Function is saved in a variable - resolve it
    const variableName = secondArg.name;
    const declarations = [].concat.apply([], [
      astUtils.getVariableDeclarationsByName(ast, variableName),
      astUtils.getFunctionDeclarationsByName(ast, variableName)
    ]);

    if (declarations.length === 1) {
      possibleDefinitionFunction = declarations[0];
    } else {
      throw new Error(`Cannot resolve definition function from variable: ${variableName}`);
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
  } else if (possibleDefinitionFunction.type === 'FunctionExpression' || possibleDefinitionFunction.type === 'FunctionDeclaration') {
    // Standard function
    return possibleDefinitionFunction;
  } else {
    throw new Error('Cannot find definition function');
  }
}

// Loading templates

function getTemplateInfo(templateProperty, templateUrlProperty, filePath, ast) {
  if (templateProperty && templateProperty.type === 'CallExpression' && templateProperty.callee.name === 'require') {
    // Required template file
    const requiredPath = templateProperty.arguments[0].value;
    const templatePath = astUtils.resolveRequirePath(requiredPath, filePath);
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
      contents: reduceComplexTemplate(templateProperty, ast)
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

function reduceComplexTemplate(templateProperty, ast) {
  if (templateProperty.type === 'BinaryExpression') {
    return reduceConcatenatedTemplate(templateProperty);
  } else if (templateProperty.type === 'CallExpression') {
    return reduceArrayJoinTemplate(templateProperty);
  } else if (templateProperty.type === 'Identifier') {
    return reduceTemplateFromVariable(templateProperty.name, ast);
  } else {
    throw new Error('invalid complex template');
  }
}

function reduceTemplateFromVariable(variableName, ast) {
  const declarations = astUtils.getVariableDeclarationsByName(ast, variableName);
  if (declarations.length === 1) {
    return reduceComplexTemplate(declarations[0], ast);
  } else {
    throw new Error(`Cannot resolve template from variable: ${variableName}`);
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
    return fsUtils.getFileExists(templatePath)
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
  return fsUtils.getFileContents(templatePath)
}
