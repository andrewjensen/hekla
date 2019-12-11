import path from 'path';
import walk, { FilterFunction } from 'tree-walk';
const babelParser = require('@babel/parser');
const HtmlParser = require('htmlparser2').Parser;
const DomHandler = require('domhandler');

import ASTWrapper, { ASTNode } from './ASTWrapper';
import DOMWrapper, { DOMNode } from './DOMWrapper';

export { ASTWrapper, DOMWrapper };

interface ImportInfo {
  type: 'ES6' | 'CommonJS',
  value: string
}

// TODO: make sync and async versions
export function parseAST(fileContents: string, filePath?: string): Promise<ASTNode> {
  try {
    const ast = babelParser.parse(fileContents, {
      sourceType: 'module',
      plugins: [
        'objectRestSpread',
        'dynamicImport',
        'classProperties',
        'jsx',
        'typescript',
        'optionalCatchBinding',
      ]
    });
    return Promise.resolve(ast);
  } catch (err) {
    return Promise.reject(err);
  }
}

export function parseHTML(source: string): Promise<DOMNode> {
  return new Promise((resolve, reject) => {
    try {
      const handler = new DomHandler((err: Error, dom: DOMNode) => {
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

export function getNodesByType(tree: ASTNode, nodeType: string): ASTNode[] {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && value.type === nodeType);
}

export function filterNodes(tree: ASTNode, filterFunction: FilterFunction) {
  return walk.filter(tree, walk.preorder, (value, key, parent) => isASTNode(value, key, parent) && filterFunction(value, key, parent));
}

export function isPromiseCall(callExpNode: ASTNode): boolean {
  return looksLike(callExpNode, {
    callee: {
      property: {
        type: 'Identifier',
        name: 'then'
      }
    }
  });
}

export function isASTNode(value: unknown, key: unknown, parent: ASTNode): value is ASTNode {
  return (value && typeof value === 'object' && (value as ASTNode).type);
}

export function looksLike(a: ASTNode, b: any): boolean {
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

function isPrimitive(val: unknown): boolean {
  return val == null || /^[sbn]/.test(typeof val)
}

/**
 * Gets a deep property from a node, if it exists.
 * If the property does not exist, undefined is returned
 *
 * Example:
 * getDeepProperty(myCallNode, 'callee.property.name')
 */
export function getDeepProperty(node: ASTNode, deepProperty: string) {
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

export function reduceCallName(callExpressionNode: ASTNode): string {
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

export function reduceMemberName(memberExpressionNode: ASTNode): string {
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

export function getFunctionDeclarationsByName(node: ASTNode, identifierName: string): ASTNode[] {
  return getNodesByType(node, 'FunctionDeclaration')
    .filter(node => getDeepProperty(node, 'id.name') === identifierName);
}

export function getVariableDeclarationsByName(node: ASTNode, identifierName: string): ASTNode[] {
  const results: ASTNode[] = [];

  const declarationNodes = getNodesByType(node, 'VariableDeclaration');
  declarationNodes.forEach(node => {
    node.declarations.forEach((declarator: ASTNode) => {
      if (declarator.id.type === 'Identifier' && declarator.id.name === identifierName) {
        results.push(declarator.init);
      }
    });
  });

  return results;
}

export function resolveRequirePath(requiredPathString: string, modulePath: string): string {
  let cleanRequiredPath = requiredPathString;
  if (requiredPathString.indexOf('!') !== -1) {
    const pieces = requiredPathString.split('!');
    cleanRequiredPath = pieces[pieces.length - 1];
  }
  return path.resolve(modulePath, '..', cleanRequiredPath);
}

export function getImportInfo(ast: ASTNode): ImportInfo[] {
  const es6Imports = getES6Imports(ast);
  const commonjsImports = getCommonJSImports(ast);
  return mergeArrays([es6Imports, commonjsImports]);
}

function getES6Imports(ast: ASTNode): ImportInfo[] {
  return getNodesByType(ast, 'ImportDeclaration')
    .filter(node => node.source.type === 'StringLiteral')
    .map(node => ({
      type: 'ES6',
      value: node.source.value
    }));
}

function getCommonJSImports(ast: ASTNode): ImportInfo[] {
  return getNodesByType(ast, 'CallExpression')
    .filter(node => node.callee.type === 'Identifier' && node.callee.name === 'require')
    .map(node => ({
      type: 'CommonJS',
      value: node.arguments[0].value
    }));
}

// TODO: copied from ParserResult... refactor to somewhere common
function mergeArrays(arrays: any[]): any[] {
  return [].concat.apply([], arrays);
}

function simplifyFunctionDeclarationNode(node: ASTNode) {
  return {
    id: node.id.name
  };
}

function simplifyVariableDeclarationNode(node: ASTNode) {
  return {
    type: node.type,
    kind: node.kind,
    id: node.declarations[0].id.name
  };
}
