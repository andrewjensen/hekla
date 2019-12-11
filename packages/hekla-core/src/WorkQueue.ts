import asyncLib from 'async';
import Module from './Module';
import {
  StatusMessage,
  moduleQueued,
  moduleSuccessful,
  moduleFailed
} from './StatusMessage';
import { IAnalyzer } from './interfaces';

type StatusCallback = (message: StatusMessage) => void
type UnsubscribeFunction = () => void

type DrainResolverFunction = () => void
type DrainRejecterFunction = (error: Error) => void

interface AsyncQueue {
  drain: () => void
  push: (task: any) => void
}

interface Task {
  module: Module
}

export default class WorkQueue {
  analyzer: IAnalyzer
  statusCallbacks: StatusCallback[]
  started: boolean
  workerCount: number
  workersOccupied: Set<number>
  queueWorking: boolean
  queueDrainResolver: null | DrainResolverFunction
  queueDrainRejecter: null | DrainRejecterFunction
  queue: null | AsyncQueue

  constructor(analyzer: IAnalyzer) {
    this.analyzer = analyzer;
    this.statusCallbacks = [];
    this.started = false;

    this.workerCount = 0;
    this.workersOccupied = new Set();
    this.queueWorking = false;
    this.queueDrainResolver = null;
    this.queueDrainRejecter = null;
    this.queue = null;
  }

  start(workerCount: number) {
    this.started = true;
    this.workerCount = workerCount;
    this.workersOccupied = new Set();

    this.queueWorking = true;
    this.queueDrainResolver = null;
    this.queueDrainRejecter = null;

    this.queue = asyncLib.queue(this._queueWorker.bind(this), workerCount);
    if (!this.queue) {
      // Hack to get around TS confusion; unreachable
      return;
    }
    this.queue.drain = () => {
      this.queueWorking = false;
      if (this.queueDrainResolver) {
        this.queueDrainResolver();
      }
    };
  }

  enqueue(module: Module) {
    if (!(this.queue && this.started)) {
      throw new Error('WorkQueue has not been started yet');
    }

    this.queue.push(makeTask(module))
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

  onStatusUpdate(callback: StatusCallback): UnsubscribeFunction {
    this.statusCallbacks.push(callback);

    // Return an unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks
        .filter(cb => cb !== callback);
    }
  }

  // Private methods

  async _queueWorker(task: Task) {
    this.queueWorking = true;
    const { module } = task;

    const workerId = this._claimWorkerId();

    try {
      this._sendStatusUpdate(moduleQueued(module.getName(), workerId));

      await this.analyzer.processModule(module);
      this._sendStatusUpdate(moduleSuccessful(module.getName(), workerId));
      this._freeWorkerId(workerId);
    } catch (err) {
      this._sendStatusUpdate(moduleFailed(module.getName(), workerId, err));
    }
  }

  _sendStatusUpdate(statusMessage: StatusMessage) {
    for (let callback of this.statusCallbacks) {
      callback(statusMessage);
    }
  }

  _claimWorkerId() {
    let availableId = -1;
    for (let id = 0; id < this.workerCount; id++) {
      if (!this.workersOccupied.has(id)) {
        availableId = id;
        break;
      }
    }
    if (availableId === -1) {
      throw new Error('No free workers');
    }
    this.workersOccupied.add(availableId);
    return availableId;
  }

  _freeWorkerId(id: number) {
    if (id === -1) {
      throw new Error('Unknown renderer');
    }
    this.workersOccupied.delete(id);
  }
}

function makeTask(module: Module): Task {
  return { module };
}
