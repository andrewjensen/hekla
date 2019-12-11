import {
  getModuleName,
  getModuleShortName
} from './utils/fs-utils';

const RESERVED_PROPERTIES = [
  'name',
  'shortName'
];

interface ModuleMeta {
  [key: string]: unknown
}

interface SerializedModule {
  name: string
  shortName: string
  error?: Error
  [key: string]: unknown
}

// FIXME: make sure everybody else imports Module correctly
export default class Module {
  _resource: string
  _rootPath: string
  _name: string
  _shortName: string
  _meta: ModuleMeta
  _error: null | Error

  constructor(resource: string, rootPath: string) {
    this._resource = resource;
    this._rootPath = rootPath;
    this._name = getModuleName(resource, rootPath);
    this._shortName = getModuleShortName(this._name);
    this._meta = {};
    this._error = null;
  }

  getName(): string {
    return this._name;
  }

  getResource(): string {
    return this._resource;
  }

  set(propertyName: string, propertyValue: unknown) {
    if(RESERVED_PROPERTIES.includes(propertyName)) {
      throw new Error(`The '${propertyName}' property is reserved`);
    }
    this._meta[propertyName] = propertyValue;
  }

  setError(error: Error) {
    this._error = error;
  }

  serialize(): SerializedModule {
    const result: SerializedModule = {
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
