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
    this._meta[propertyName] = propertyValue;
  }

  setError(error) {
    this._error = error;
  }

  serialize() {
    const result = {
      ...this._meta,
      name: this._name
    };
    if (this._error) {
      result.error = this._error;
    }
    return result;
  }
}
