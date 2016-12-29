'use strict';

module.exports = class DependencyGraph {
  constructor() {
    this.nodes = [];
    this.nodeMap = new Map();
    this.links = [];
    this.fromLinks = new Map(); // Map<LinkId, Set<Link>>
    this.toLinks = new Map(); // Map<LinkId, Set<Link>>
  }

  // NODES ---------------------------------------------------------------------

  addNode(id, value) {
    this.nodes.push(createNode(id, value));
    this.nodeMap.set(id, value);
  }

  hasNode(id) {
    return this.nodeMap.has(id);
  }

  getNode(id) {
    return this.nodeMap.get(id);
  }

  countNodes() {
    return this.nodes.length;
  }

  removeNode(id) {
    // Delete the node itself
    this.nodeMap.delete(id);
    this.nodes = this.nodes.filter(n => n.id !== id);

    // Delete the links to and from the node too
    this.links = this.links.filter(l => l.source !== id && l.target !== id);
    this.fromLinks.delete(id);
    this.fromLinks.forEach((fromSet) => {
      fromSet.forEach((link) => {
        if (link.target === id) {
          fromSet.delete(link);
        }
      });
    });
    this.toLinks.delete(id);
    this.toLinks.forEach((toSet) => {
      toSet.forEach((link) => {
        if (link.source === id) {
          toSet.delete(link);
        }
      });
    });
  }

  // LINKS ---------------------------------------------------------------------

  addLink(sourceId, targetId) {
    const foundDuplicate = this.hasLink(sourceId, targetId);
    if (foundDuplicate) {
      throw new Error('Cannot add the same link twice');
    }

    // Store the link in a basic array.
    const link = createLink(sourceId, targetId);
    this.links.push(link);

    // Store the link in the fromLinks Map.
    if (!this.fromLinks.has(sourceId)) {
      this.fromLinks.set(sourceId, new Set());
    }
    this.fromLinks.get(sourceId).add(link);

    // Store the link in the toLinks Map.
    if (!this.toLinks.has(targetId)) {
      this.toLinks.set(targetId, new Set());
    }
    this.toLinks.get(targetId).add(link);
  }

  hasLink(sourceId, targetId) {
    const link = this.getLink(sourceId, targetId);
    return (!!link);
  }

  getLink(sourceId, targetId) {
    const toSet = this.fromLinks.get(sourceId);
    if (!toSet) return null;

    for (let link of toSet) {
      if (link.target === targetId) {
        return link;
      }
    }
    return null;
  }

  getLinksFrom(sourceId) {
    const toSet = this.fromLinks.get(sourceId);
    if (!toSet) return [];

    const results = [];
    for (let link of toSet) {
      results.push(link);
    }
    return results.sort(sortByTargetAsc);
  }

  getLinksTo(targetId) {
    const fromSet = this.toLinks.get(targetId);
    if (!fromSet) return [];

    const results = [];
    for (let link of fromSet) {
      results.push(link);
    }
    return results.sort(sortBySourceAsc);
  }

  countLinks() {
    return this.links.length;
  }

  // trimLinks() {
  //   this.links = this.links.filter(link => this.nodeMap.has(link.source));
  // }

  // OUTPUTS -------------------------------------------------------------------

  serialize() {
    return {
      nodes: this.nodes,
      links: this.links
    };
  }

  toString() {
    return `[DependencyGraph: ${this.nodes.length} nodes, ${this.links.length} links]`;
  }

  // createSubgraph(topLevelModuleId) {
  //   const subgraph = new DependencyGraph();
  //
  //   // Keep a stack of modules that need to be visited
  //   const moduleIdStack = [];
  //   moduleIdStack.push(topLevelModuleId);
  //   while (moduleIdStack.length > 0) {
  //     const moduleId = moduleIdStack.pop();
  //     if (subgraph.hasModule(moduleId)) {
  //       // We've already added this module
  //       break;
  //     }
  //
  //     const module = this.moduleMap.get(moduleId);
  //     // Add the module to the subgraph
  //     subgraph.addModule(module);
  //
  //     // Add the children of this module to the stack
  //     const childIds = this.links
  //       .filter(link => link.source === moduleId)
  //       .map(link => link.target);
  //     childIds
  //       .filter(childId => !subgraph.hasModule(childId))
  //       .forEach(childId => {
  //         moduleIdStack.push(childId)
  //       });
  //   }
  //
  //   subgraph.trimLinks();
  //
  //   return subgraph;
  // }

  /**
   * Modified Dijkstra's algorithm
   * https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
   */
//   calculateLevels(topLevelModuleId) {
//     // Create a set of unvisited nodes
//     const unvisitedModuleIds = new Set();
//     this.modules.forEach(module => {
//       if (module.id === topLevelModuleId) {
//         module.level = 0;
//       } else {
//         module.level = Infinity;
//         unvisitedModuleIds.add(module.id);
//       }
//     });
//
//     let currentModule = this.moduleMap.get(topLevelModuleId);
//     let currentLevel = currentModule.level = 0;
//     while (currentModule && unvisitedModuleIds.size > 0) {
//       // console.log('visiting node: ', currentModule.name);
//       currentLevel = currentModule.level;
//
//       // Mark tentative distances for the children of each node
//       const unvisitedChildren = getChildModules(this.moduleMap, this.links, currentModule)
//         .filter(childModule => unvisitedModuleIds.has(childModule.id));
//       unvisitedChildren.forEach(child => {
//         // console.log('\tupdating child', child.id);
//         child.level = currentModule.level + 1;
//       });
//
//       unvisitedModuleIds.delete(currentModule.id);
//
//       // Mark the actual level of the node
//       // TODO: Implement!
//       // const maxParentLevel = getParentModules(this.moduleMap, this.links, currentModule)
//       //   .reduce((maxLevel, module) => (module.level > maxLevel ? module.level : maxLevel),
//       //     currentModule.level - 1);
//       // currentModule.level = maxParentLevel + 1;
//
//       // TODO: is this edge case real?
//       // if (currentModule.id === topLevelModuleId) {
//       //   currentModule.level = 0;
//       // }
//
//       // Pick the next currentModule
//       // console.log('unvisited modules:', this.modules
//       //   .filter(module => unvisitedModuleIds.has(module.id))
//       //   .map(Utils.simplifyModule));
//
//       const nextModule = this.modules
//         .filter(module => unvisitedModuleIds.has(module.id))
//         .reduce((lowestLevelModule, module) => {
//           if (!lowestLevelModule || module.level < lowestLevelModule.level) {
//             return module;
//           } else {
//             return lowestLevelModule;
//           }
//         }, null);
//       currentModule = nextModule;
//
//       if (!currentModule) {
//         break;
//       }
//       console.log('next module: ', Utils.simplifyModule(currentModule));
//     }
//   }

}; // End class DependencyGraph

// Utility functions

function createNode(id, value) {
  return {
    id,
    value
  };
}

function createLink(sourceId, targetId) {
  return {
    source: sourceId,
    target: targetId
  };
}

function sortBySourceAsc(linkA, linkB) {
  return (linkA.source - linkB.source);
}

function sortByTargetAsc(linkA, linkB) {
  return (linkA.target - linkB.target);
}

// function getChildModules(moduleMap, links, currentModule) {
//   const childLinks = links.filter(link => link.source === currentModule.id);
//   const children = childLinks.map(childLink => moduleMap.get(childLink.target));
//   return children;
// }
//
// function getParentModules(moduleMap, links, currentModule) {
//   const parentLinks = links.filter(link => link.target === currentModule.id);
//   const parents = parentLinks.map(parentLink => moduleMap.get(parentLink.source));
//   return parents;
// }
