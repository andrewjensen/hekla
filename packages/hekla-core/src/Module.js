const {
  getModuleName,
  getModuleShortName
} = require('./utils/fs-utils');

const RESERVED_PROPERTIES = [
  'name',
  'shortName'
];

module.exports = class Module {
  constructor(resource, rootPath) {
    this._resource = resource;
    this._rootPath = rootPath;
    this._name = getModuleName(resource, rootPath);
    this._shortName = getModuleShortName(this._name);
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
    if(RESERVED_PROPERTIES.includes(propertyName)) {
      throw new Error(`The '${propertyName}' property is reserved`);
    }
    this._meta[propertyName] = propertyValue;
  }

  setError(error) {
    this._error = error;
  }

  serialize() {
    const result = {
      name: this._name,
      shortName: this._shortName,
      ...this._meta
    };
    if (this._error) {
      result.error = this._error;
    }
    return result;
  }
}
