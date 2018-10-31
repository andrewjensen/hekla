// TODO: move into astUtils
const PROPERTY_UNKNOWN = 'PROPERTY_UNKNOWN';

class AngularComponentWrapper {
  constructor(componentName) {
    this.name = componentName;
    this.bindings = PROPERTY_UNKNOWN;
    this.controllerNode = PROPERTY_UNKNOWN;
  }

  setBindings(bindings) {
    this.bindings = bindings;
  }

  setControllerNode(controllerNode) {
    this.controllerNode = controllerNode;
  }
};

module.exports = {
  PROPERTY_UNKNOWN,
  AngularComponentWrapper
};
