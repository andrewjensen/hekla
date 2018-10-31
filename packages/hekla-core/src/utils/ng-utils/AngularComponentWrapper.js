// TODO: move into astUtils
const PROPERTY_UNKNOWN = 'PROPERTY_UNKNOWN';

class AngularComponentWrapper {
  constructor(componentName) {
    this.name = componentName;
    this.bindings = PROPERTY_UNKNOWN;
    this.controller = PROPERTY_UNKNOWN;
  }

  setBindings(bindings) {
    this.bindings = bindings;
  }

  setController(controllerWrapper) {
    this.controller = controllerWrapper;
  }
};

module.exports = {
  PROPERTY_UNKNOWN,
  AngularComponentWrapper
};
