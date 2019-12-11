import { IHeklaConfig, IHeklaPlugin } from "./interfaces";

interface MaybeHeklaConfig {
  rootPath?: unknown
  outputPath?: unknown
  exclude?: unknown[]
  plugins?: unknown[]
}

export default class ConfigValidator {
  errors: string[]

  constructor() {
    this.errors = [];
  }

  validate(config: MaybeHeklaConfig): config is IHeklaConfig {
    if (!config.hasOwnProperty('rootPath')) {
      this.errors.push('rootPath is not configured');
    }

    if (config.hasOwnProperty('outputPath')) {
      if (typeof config.outputPath !== 'string') {
        this.errors.push('Output path is not a string');
      } else if (config.outputPath.match(/\.[a-zA-Z0-9]+$/)) {
        this.errors.push('Output path must be a directory');
      }
    }

    if (config.exclude) {
      for (let excludePattern of config.exclude) {
        if (typeof excludePattern !== 'string') {
          this.errors.push('Exclude pattern is not a string');
        }
      }
    }

    if (config.plugins) {
      for (let plugin of config.plugins) {
        if (!isPlugin(plugin)) {
          this.errors.push('Plugin does not have an `apply` method');
        }
      }
    }

    return this.isValid();
  }

  isValid(): boolean {
    return (this.errors.length === 0);
  }

  getErrors(): string[] {
    return this.errors;
  }
}

function isPlugin(plugin: unknown): plugin is IHeklaPlugin {
  if (typeof plugin !== 'object' || !plugin) {
    return false;
  }

  if (!(plugin as IHeklaPlugin).apply) {
    return false;
  }

  if (typeof (plugin as IHeklaPlugin).apply !== 'function') {
    return false;
  }

  return true;
}
