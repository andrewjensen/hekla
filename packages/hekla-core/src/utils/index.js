'use strict';

const fs = require('fs');
const babylon = require('babylon');
const walk = require('tree-walk');

module.exports = {
  getFileExists,
  getFileContents,
  writeJSON,
  parseAST,
  getNodesByType,
  filterNodes,
  isPromiseCall,
  isASTNode,
  reduceCallName,
  reduceMemberName,
  getVariableDeclarationsByName
}

function getFileExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) return reject(err);

      resolve(stats.isFile());
    });
  });
}

function getFileContents(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, contents) => {
      if (err) return reject(err);

      resolve(contents);
    });
  });
}

function writeJSON(data, filePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);

      resolve();
    });
  })
}

function parseAST(fileContents, filePath) {
  try {
    const ast = babylon.parse(fileContents, {
      sourceType: 'module'
    });
    return Promise.resolve(ast);
  } catch (err) {
    return Promise.reject(err);
  }
}

function getNodesByType(tree, nodeType) {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && value.type === nodeType);
}

function filterNodes(tree, filterFunction) {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && filterFunction(value, key, parent));
}

function isPromiseCall(callExpNode) {
  return (callExpNode.callee.property &&
    callExpNode.callee.property.type === 'Identifier' &&
    callExpNode.callee.property.name === 'then');
}

function isASTNode(value, key, parent) {
  return (value && typeof value === 'object' && value.type);
}

function reduceCallName(callExpressionNode) {
  const callee = callExpressionNode.callee;
  if (callee.type === 'Identifier') {
    return callee.name;
  } else if (callee.type === 'MemberExpression') {
    return reduceMemberName(callee);
  } else if (callee.type === 'CallExpression') {
    return '(CallExpression)';
  } else {
    throw new Error(`callee type not handled: ${callee.type}`);
  }
}

function reduceMemberName(memberExpressionNode) {
  let objectName;
  if (memberExpressionNode.object.type === 'MemberExpression') {
     objectName = reduceMemberName(memberExpressionNode.object);
  } else if (memberExpressionNode.object.type === 'Identifier') {
    objectName = memberExpressionNode.object.name;
  } else if (memberExpressionNode.object.type === 'CallExpression') {
    objectName = '(CallExpressionInMember)';
  } else if (memberExpressionNode.object.type === 'ArrayExpression') {
    objectName = '(ArrayExpressionInMember)';
  } else {
    throw new Error(`node type not handled: ${memberExpressionNode.object.type}`);
  }

  let propertyName = memberExpressionNode.property.name;

  return `${objectName}.${propertyName}`;
}

function getVariableDeclarationsByName(node, identifierName) {
  const results = [];

  const declarationNodes = getNodesByType(node, 'VariableDeclaration');
  declarationNodes.forEach(node => {
    node.declarations.forEach(declarator => {
      if (declarator.id.type === 'Identifier' && declarator.id.name === identifierName) {
        results.push(declarator.init);
      }
    });
  });

  return results;
}

function simplifyFunctionDeclarationNode(node) {
  return {
    id: node.id.name
  };
}

function simplifyVariableDeclarationNode(node) {
  return {
    type: node.type,
    kind: node.kind,
    id: node.declarations[0].id.name
  };
}
