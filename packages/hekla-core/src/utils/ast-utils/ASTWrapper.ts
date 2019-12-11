import walk from 'tree-walk';
const { VISITOR_KEYS } = require('@babel/types');

// TODO: define a custom walker based on VISITOR_KEYS
// (See DOMWalker)

export type ASTNode = any; // TODO: lock down types based on babel

type VisitorsMap = {
  [nodeType: string]: (node: ASTNode) => void
}

export default class ASTWrapper {
  ast: ASTNode

  constructor(ast: ASTNode) {
    this.ast = ast;
  }

  unwrap() {
    return this.ast;
  }

  visit(visitors: VisitorsMap) {
    for (let key in visitors) {
      if (!VISITOR_KEYS.hasOwnProperty(key)) {
        throw new TypeError(`Invalid visitor type: ${key}`);
      }
    }

    walk.preorder(this.ast, (node: ASTNode) => callVisitor(node, visitors, this.ast));
  }
}

// TODO: what was `dom` used for?
function callVisitor(node: ASTNode, visitors: VisitorsMap, dom: any) {
  if (!node) {
    return;
  }
  if (node.type && visitors[node.type]) {
    visitors[node.type](node);
  }
}
