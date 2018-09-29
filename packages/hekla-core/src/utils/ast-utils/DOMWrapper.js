const walk = require('tree-walk');

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
    this.visitors = {};
  }

  unwrap() {
    return this.dom;
  }

  visit(callbacks) {
    if (callbacks.tag) {
      this.addVisitor('tag', callbacks.tag);
    }
    if (callbacks.text) {
      this.addVisitor('text', callbacks.text);
    }
  }

  addVisitor(type, callback) {
    if (!this.visitors[type]) {
      this.visitors[type] = [];
    }
    this.visitors[type].push(callback);
  }

  walk() {
    domWalker.preorder(this.dom, (node) => this.delegate(node));
  }

  delegate(node) {
    if (node === this.dom) {
      // Skip the root-level array of nodes, wait to visit each actual node
      return;
    }

    if (!node || !node.type) {
      throw new TypeError('Unrecognized tree node');
    }

    if (node.type === 'tag' && this.visitors['tag']) {
      for (let childVisitor of this.visitors['tag']) {
        childVisitor(node);
      }
    } else if (node.type === 'text' && this.visitors['text']) {
      for (let childVisitor of this.visitors['text']) {
        childVisitor(node);
      }
    }
  }
}
