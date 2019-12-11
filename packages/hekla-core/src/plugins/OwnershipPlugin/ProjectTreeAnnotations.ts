const DEBUG_ADD = false;
const DEBUG_MATCH = false;

interface Node {
  name: string
  metadata?: NodeMetadata
  children: Node[]
}

type NodeMetadata = any

export default class ProjectTreeAnnotations {
  root: Node

  constructor() {
    this.root = makeNode('.');
  }

  toJson() {
    return this.root;
  }

  add(path: string, metadata: NodeMetadata) {
    if (DEBUG_ADD) {
      console.log(`Adding ${path} to filesystem`);
    }

    const pieces = path.split('/');
    let node = this.root;

    for (let i = 1; i < pieces.length; i++) {
      const piece = pieces[i];
      if (DEBUG_ADD) {
        console.log(`  Looking at ${piece}`);
      }

      let childNode = node.children.find(n => n.name === piece);
      if (!childNode) {
        if (DEBUG_ADD) {
          console.log(`    No match, creating node`);
        }
        const newChild = makeNode(piece);
        node.children.push(newChild);
        childNode = newChild;
      }

      node = childNode;
    }

    node.metadata = metadata;
  }

  match(path: string) {
    if (DEBUG_MATCH) {
      console.log(`Looking for a match for ${path}`);
    }

    const pieces = path.split('/');
    let node = this.root;
    let foundMetadata = null;

    for (let i = 1; i < pieces.length; i++) {
      if (node.metadata) {
        foundMetadata = node.metadata;
        if (DEBUG_MATCH) {
          console.log(` Found metadata: ${JSON.stringify(foundMetadata)}`);
        }
      }

      const piece = pieces[i];
      if (DEBUG_MATCH) {
        console.log(`  Looking at ${piece}`);
      }

      let childNode = node.children.find(n => n.name === piece);
      if (!childNode) {
        if (DEBUG_MATCH) {
          console.log(`  Not in the tree`);
        }
        return foundMetadata;
      }
      node = childNode;
    }

    if (DEBUG_MATCH) {
      console.log(`  Found match: ${JSON.stringify(node.metadata)}`);
    }
    return node.metadata;
  }
}

function makeNode(name: string): Node {
  return {
    name,
    children: []
  };
}
