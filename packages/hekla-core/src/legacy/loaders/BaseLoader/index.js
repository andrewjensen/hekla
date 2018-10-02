'use strict';

/**
 * An abstract class in charge of loading modules.
 * A module contains a path, id, and source.
 */
module.exports = class BaseLoader {
  constructor() {

  }

  loadModules() {
    return Promise.reject(new Error('Abstract method loadModules not implemented'));
  }
};
