'use strict';

const path = require('path');
const babelParser = require('@babel/parser');
const HtmlParser = require('htmlparser2').Parser;
const DomHandler = require('domhandler');
const walk = require('tree-walk');

const ASTWrapper = require('./ASTWrapper');
const DOMWrapper = require('./DOMWrapper');

module.exports = {
  parseAST,
  parseHTML,
  ASTWrapper,
  DOMWrapper,
  getNodesByType,
  filterNodes,
  isPromiseCall,
  isASTNode,
  looksLike,
  getDeepProperty,
  reduceCallName,
  reduceMemberName,
  getFunctionDeclarationsByName,
  getVariableDeclarationsByName,
  resolveRequirePath,
  getImportInfo
};

// TODO: make sync and async versions
function parseAST(fileContents, filePath) {
  try {
    const ast = babelParser.parse(fileContents, {
      sourceType: 'module',
      plugins: [
        'objectRestSpread',
        'dynamicImport',
        'classProperties',
        'jsx',
        'typescript',
      ]
    });
    return Promise.resolve(ast);
  } catch (err) {
    return Promise.reject(err);
  }
}

function parseHTML(source) {
  return new Promise((resolve, reject) => {
    try {
      const handler = new DomHandler((err, dom) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(dom);
        }
      });
      const options = {};
      const parser = new HtmlParser(handler, options);
      parser.write(source);
      parser.end();
    } catch (err) {
      reject(err);
    }
  });
}

function getNodesByType(tree, nodeType) {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && value.type === nodeType);
}

function filterNodes(tree, filterFunction) {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && filterFunction(value, key, parent));
}

function isPromiseCall(callExpNode) {
  return looksLike(callExpNode, {
    callee: {
      property: {
        type: 'Identifier',
        name: 'then'
      }
    }
  });
}

function isASTNode(value, key, parent) {
  return (value && typeof value === 'object' && value.type);
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}

function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val)
}

/**
 * Gets a deep property from a node, if it exists.
 * If the property does not exist, undefined is returned
 *
 * Example:
 * getDeepProperty(myCallNode, 'callee.property.name')
 */
function getDeepProperty(node, deepProperty) {
  const pieces = deepProperty.split('.');
  let currentChildNode = node;
  for (let i = 0; i < pieces.length; i++) {
    if (!currentChildNode.hasOwnProperty(pieces[i])) {
      // A property along the chain is missing
      return undefined;
    }

    if (i === pieces.length - 1) {
      // This is the deep property
      return currentChildNode[pieces[i]];
    }

    // Go to the next node down in the chain
    currentChildNode = currentChildNode[pieces[i]];
  }

  return undefined;
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

function getFunctionDeclarationsByName(node, identifierName) {
  return getNodesByType(node, 'FunctionDeclaration')
    .filter(node => getDeepProperty(node, 'id.name') === identifierName);
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

function resolveRequirePath(requiredPathString, modulePath) {
  let cleanRequiredPath = requiredPathString;
  if (requiredPathString.indexOf('!') !== -1) {
    const pieces = requiredPathString.split('!');
    cleanRequiredPath = pieces[pieces.length - 1];
  }
  return path.resolve(modulePath, '..', cleanRequiredPath);
}

function getImportInfo(ast) {
  const es6Imports = getES6Imports(ast);
  const commonjsImports = getCommonJSImports(ast);
  return mergeArrays([es6Imports, commonjsImports]);
}

function getES6Imports(ast) {
  return getNodesByType(ast, 'ImportDeclaration')
    .filter(node => node.source.type === 'StringLiteral')
    .map(node => ({
      type: 'ES6',
      value: node.source.value
    }));
}

function getCommonJSImports(ast) {
  return getNodesByType(ast, 'CallExpression')
    .filter(node => node.callee.type === 'Identifier' && node.callee.name === 'require')
    .map(node => ({
      type: 'CommonJS',
      value: node.arguments[0].value
    }));
}

// TODO: copied from ParserResult... refactor to somewhere common
function mergeArrays(arrays) {
  return [].concat.apply([], arrays);
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
