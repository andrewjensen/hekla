module.exports = class Module {
  constructor(moduleName, resource) {
    this._name = moduleName;
    this._resource = resource;
    this._meta = {};
    this._error = null;
  }

  getName() {
    return this._name;
  }

  getResource() {
    return this._resource;
  }

  set(propertyName, propertyValue) {
    if (propertyName === 'name') {
      throw new Error(`Cannot change a Module's name property`);
    }
    this._meta[propertyName] = propertyValue;
  }

  setError(error) {
    this._error = error;
  }

  serialize() {
    const result = {
      name: this._name,
      ...this._meta
    };
    if (this._error) {
      result.error = this._error;
    }
    return result;
  }
}
