module.exports = class ConfigValidator {
  constructor() {
    this.errors = [];
  }

  validate(config) {
    if (!config.hasOwnProperty('rootPath')) {
      this.errors.push('rootPath is not configured');
    }

    if (config.hasOwnProperty('exclude')) {
      for (let excludePattern of config.exclude) {
        if (typeof excludePattern !== 'string') {
          this.errors.push('Exclude pattern is not a string');
        }
      }
    }

    if (config.hasOwnProperty('plugins')) {
      for (let plugin of config.plugins) {
        if (!(plugin.apply && typeof plugin.apply === 'function')) {
          this.errors.push('Plugin does not have an `apply` method');
        }
      }
    }

    return this.isValid();
  }

  isValid() {
    return (this.errors.length === 0);
  }

  getErrors() {
    return this.errors;
  }
}
