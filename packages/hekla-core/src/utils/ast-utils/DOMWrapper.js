const walk = require('tree-walk');

const NODE_TYPES = [
  'tag',
  'text',
  'comment',
  'directive'
];

const domWalker = walk(el => {
  // https://www.npmjs.com/package/tree-walk#custom-walkers
  if (Array.isArray(el)) {
    return el;
  } else if (el.type) {
    if (el.children) {
      return el.children;
    } else {
      return [];
    }
  } else {
    throw new TypeError('Unrecognized tree node');
  }
});

module.exports = class DOMWrapper {
  constructor(dom) {
    this.dom = dom;
  }

  unwrap() {
    return this.dom;
  }

  visit(visitors) {
    for (let key in visitors) {
      if (!NODE_TYPES.includes(key)) {
        throw new TypeError(`Invalid visitor type: ${key}`);
      }
    }

    domWalker.preorder(this.dom, (node) => callVisitor(node, visitors, this.dom));
  }
}

function callVisitor(node, visitors, dom) {
  if (node === dom) {
    // Skip the root-level array of nodes, wait to visit each actual node
    return;
  }

  if (!node || !node.type) {
    throw new TypeError('Unrecognized tree node');
  }

  if (node.type === 'tag' && visitors['tag']) {
    visitors['tag'](node);
  } else if (node.type === 'text' && visitors['text']) {
    visitors['text'](node);
  }
}