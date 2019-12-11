import chalk from 'chalk';
import StickyTerminalDisplay, { LineRenderer } from 'sticky-terminal-display';

import { IAnalyzer } from "../interfaces";
import {
  StatusMessage,
  AnalysisStartedMessage,
  ModuleQueuedMessage,
  ModuleSuccessfulMessage,
  ModuleFailedMessage
} from "../StatusMessage";
import { TYPES } from '../StatusMessage';

const MAX_MODULE_NAME_LENGTH = 80;

interface Stats {
  completed: number
  errors: number
  found: number
}

export default class StatusUpdatePlugin {
  workerCount: number
  stats: Stats
  summaryRenderer?: LineRenderer
  workerRenderers?: LineRenderer[]

  constructor() {
    this.workerCount = 0;
    this.stats = {
      completed: 0,
      errors: 0,
      found: 0
    };
  }

  apply(analyzer: IAnalyzer) {
    analyzer.hooks.statusUpdate.tap('StatusUpdatePlugin', this.onStatusUpdate.bind(this));
  }

  onStatusUpdate(message: StatusMessage) {
    try {
      switch (message.type) {
        case TYPES.STATUS_ANALYSIS_STARTED:
          return this.analysisStarted((message as AnalysisStartedMessage).payload.workerCount);

        case TYPES.STATUS_ANALYSIS_SUCCESSFUL:
          return this.analysisSuccessful();

        case TYPES.STATUS_MODULE_QUEUED:
          return this.moduleQueued((message as ModuleQueuedMessage).payload.moduleName, (message as ModuleQueuedMessage).payload.workerId);

        case TYPES.STATUS_MODULE_SUCCESSFUL:
          return this.moduleSuccessful((message as ModuleSuccessfulMessage).payload.workerId);

        case TYPES.STATUS_MODULE_FAILED:
            return this.moduleFailed((message as ModuleFailedMessage).payload.workerId);

        default:
          throw new Error(`Unhandled status update type: ${message.type}`);
      }
    } catch (err) {
      console.log('Error in event handler:', err);
      throw err;
    }
  }

  // Event handlers

  analysisStarted(workerCount: number) {
    this.workerCount = workerCount;
    this.stats = {
      completed: 0,
      errors: 0,
      found: 0
    };
    const display = new StickyTerminalDisplay();

    this.summaryRenderer = display.getLineRenderer();

    this.workerRenderers = [];
    for (let i = 0; i < workerCount; i++) {
      const renderer = display.getLineRenderer();
      this.workerRenderers.push(renderer);
    }
  }

  analysisSuccessful() {
  }

  moduleQueued(moduleName: string, workerId: number) {
    const truncatedModuleName = truncateStringRight(moduleName, MAX_MODULE_NAME_LENGTH);
    this.getWorkerRenderer(workerId)
      .write(`  ${chalk.bold(`Worker ${workerId + 1}`)}: ${truncatedModuleName}`);

    this.stats.found++;
    this.printSummary();
  }

  moduleSuccessful(workerId: number) {
    this.getWorkerRenderer(workerId)
      .write(`  ${chalk.bold(`Worker ${workerId + 1}`)}: free`);

    this.stats.completed++;
    this.printSummary();
  }

  moduleFailed(workerId: number) {
    this.getWorkerRenderer(workerId)
      .write(`  ${chalk.bold(`Worker ${workerId + 1}`)}: free`);

    this.stats.errors++;
    this.printSummary();
  }

  // Rendering helpers

  printSummary() {
    const { completed, errors, found } = this.stats;
    const processed = completed + errors;
    this.summaryRenderer!.write(`Hekla: processed ${processed}/${found} modules with ${errors} errors`);
  }

  getWorkerRenderer(workerId: number) {
    return this.workerRenderers![workerId];
  }
}

function truncateStringRight(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }

  const truncated = input.substring(input.length - maxLength + 3);
  return `...${truncated}`;
}
