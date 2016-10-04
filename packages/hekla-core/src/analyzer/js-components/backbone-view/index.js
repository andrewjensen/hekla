'use strict';

const fs = require('fs');
const utils = require('../../utils');
const htmlParser = require('../../html-parser');

module.exports = {
  analyzeAllInFile: analyzeAllInFile
};

function analyzeAllInFile(ast, filePath, rootPath) {
  // console.log('analyzeAllInFile', filePath);

  return Promise.resolve(getComponentCallNodes(ast))
    .then(componentCallNodes => {
      return Promise.all(componentCallNodes.map(node => getComponentDetails(node, filePath)));
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

function getComponentCallNodes(ast) {
  return utils.getNodesByType(ast.program, 'CallExpression')
    .filter(node => {
      // Look for SOMETHING.extend({ ... })
      return (node.callee &&
              node.callee.property &&
              node.callee.property.name === 'extend' &&
              node.arguments.length === 1 &&
              node.arguments[0].type === 'ObjectExpression');
    })
    .filter(node => {
      // Look for a render() method
      const viewPropsObject = node.arguments[0];
      const renderProperty = getPropertyByName(viewPropsObject, 'render');
      return (renderProperty && renderProperty.value.type === 'FunctionExpression');
    })
    .filter(node => {
      console.log('found!');
      return true;
    });
}

function getPropertyByName(objectExpression, propertyName) {
  return objectExpression.properties.reduce(
    (foundProperty, curProperty) => (curProperty.key.name === propertyName ? curProperty : null),
    null
  );
}

function getComponentDetails(componentCallNode, filePath) {
  return getDependencies()
    .then(dependencies => {
      return {
        type: 'backbone-view',
        path: filePath,
        name: getName(filePath),
        templatePath: null,
        dependencies: dependencies
      };
    });
}

function getName(filePath) {
  const pieces = filePath.split('/');
  const filename = pieces[pieces.length - 1];
  const extensionlessFilename = filename.split('.js')[0];
  return extensionlessFilename;
}

function getDependencies() {
  //TODO: implement
  return Promise.resolve([]);
}
