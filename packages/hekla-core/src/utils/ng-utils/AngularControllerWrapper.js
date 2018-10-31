// TODO: move into astUtils
const PROPERTY_UNKNOWN = 'PROPERTY_UNKNOWN';

class AngularControllerWrapper {
  constructor() {
    this.name = PROPERTY_UNKNOWN;
    this.rootNode = PROPERTY_UNKNOWN;
  }

  setName(name) {
    this.name = name;
  }

  setRootNode(node) {
    this.rootNode = node;
  }
};

module.exports = {
  PROPERTY_UNKNOWN,
  AngularControllerWrapper
};
