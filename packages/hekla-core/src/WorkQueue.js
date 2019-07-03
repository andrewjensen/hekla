const asyncLib = require('async');

const {
  moduleQueued,
  moduleSuccessful,
  moduleFailed
} = require('./StatusMessage');

module.exports = class WorkQueue {
  constructor(analyzer) {
    this.analyzer = analyzer;
    this.statusCallbacks = [];
    this.started = false;
  }

  start(workerCount) {
    this.started = true;
    this.workerCount = workerCount;

    this.queueWorking = true;
    this.queueDrainResolver = null;
    this.queueDrainRejecter = null;

    this.queue = asyncLib.queue(this._queueWorker.bind(this), workerCount);
    this.queue.drain = () => {
      this.queueWorking = false;
      if (this.queueDrainResolver) {
        this.queueDrainResolver();
      }
    };
  }

  // TODO: refactor to handle Modules
  enqueue(moduleName, resource) {
    if (!this.started) {
      throw new Error('WorkQueue has not been started yet');
    }

    this.queue.push(makeTask(moduleName, resource))
  }

  async waitForFinish() {
    if (!this.queueWorking) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.queueDrainResolver = resolve;
      this.queueDrainRejecter = reject;
    });
  }

  onStatusUpdate(callback) {
    this.statusCallbacks.push(callback);

    // Return an unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks
        .filter(cb => cb !== callback);
    }
  }

  // Private methods

  async _queueWorker(task) {
    this.queueWorking = true;
    const { moduleName, resource } = task;

    // TODO: get the actual worker index
    const workerIdx = 0;

    let module = this.analyzer.createModule(resource);

    try {
      this._sendStatusUpdate(moduleQueued(module.getName(), workerIdx));

      await this.analyzer.processModule(module);
      this._sendStatusUpdate(moduleSuccessful(module.getName(), workerIdx));
    } catch (err) {
      this._sendStatusUpdate(moduleFailed(module.getName(), workerIdx, err));
    }
  }

  _sendStatusUpdate(statusMessage) {
    for (let callback of this.statusCallbacks) {
      callback(statusMessage);
    }
  }
}

function makeTask(moduleName, resource) {
  return { moduleName, resource };
}
