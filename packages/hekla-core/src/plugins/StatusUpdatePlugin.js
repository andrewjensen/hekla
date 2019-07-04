const chalk = require('chalk');
const StickyTerminalDisplay = require('sticky-terminal-display');
const { TYPES } = require('../StatusMessage');

const MAX_MODULE_NAME_LENGTH = 80;

module.exports = class StatusUpdatePlugin {
  apply(analyzer) {
    analyzer.hooks.statusUpdate.tap('StatusUpdatePlugin', this.onStatusUpdate.bind(this));
  }

  onStatusUpdate(message) {
    switch (message.type) {
      case TYPES.STATUS_ANALYSIS_STARTED:
        return this.analysisStarted(message.payload.workerCount);

      case TYPES.STATUS_ANALYSIS_SUCCESSFUL:
        return this.analysisSuccessful();

      case TYPES.STATUS_MODULE_QUEUED:
        return this.moduleQueued(message.payload.moduleName, message.payload.workerId);

      case TYPES.STATUS_MODULE_SUCCESSFUL:
        return this.moduleSuccessful(message.payload.workerId);

      default:
        throw new Exception(`Unhandled status update type: ${message.type}`);
    }
  }

  // Event handlers

  analysisStarted(workerCount) {
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

  moduleQueued(moduleName, workerId) {
    const truncatedModuleName = truncateStringRight(moduleName, MAX_MODULE_NAME_LENGTH);
    this.getWorkerRenderer(workerId)
      .write(`  ${chalk.bold(`Worker ${workerId + 1}`)}: ${truncatedModuleName}`);

    this.stats.found++;
    this.printSummary();
  }

  moduleSuccessful(workerId) {
    this.getWorkerRenderer(workerId)
      .write(`  ${chalk.bold(`Worker ${workerId + 1}`)}: free`);

    this.stats.completed++;
    this.printSummary();
  }

  // Rendering helpers

  printSummary() {
    const { completed, errors, found } = this.stats;
    const processed = completed + errors;
    this.summaryRenderer.write(`Hekla: processed ${processed}/${found} modules with ${errors} errors`);
  }

  getWorkerRenderer(workerId) {
    return this.workerRenderers[workerId];
  }
}

function truncateStringRight(input, maxLength) {
  if (input.length <= maxLength) {
    return input;
  }

  const truncated = input.substring(input.length - maxLength + 3);
  return `...${truncated}`;
}
