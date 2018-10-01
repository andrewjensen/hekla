const walk = require('tree-walk');
const { VISITOR_KEYS } = require('@babel/types');

// TODO: define a custom walker based on VISITOR_KEYS
// (See DOMWalker)

module.exports = class ASTWrapper {
  constructor(ast) {
    this.ast = ast;
  }

  unwrap() {
    return this.ast;
  }

  visit(visitors) {
    for (let key in visitors) {
      if (!VISITOR_KEYS.hasOwnProperty(key)) {
        throw new TypeError(`Invalid visitor type: ${key}`);
      }
    }

    walk.preorder(this.ast, (node) => callVisitor(node, visitors, this.ast));
  }
}

function callVisitor(node, visitors, dom) {
  if (!node) {
    return;
  }
  if (node.type && visitors[node.type]) {
    visitors[node.type](node);
  }
}
