// FIXME: review https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions

export interface AnalysisStartedMessage {
  type: 'STATUS_ANALYSIS_STARTED',
  payload: {
    workerCount: number
  }
}

export interface AnalysisSuccessfulMessage {
  type: 'STATUS_ANALYSIS_SUCCESSFUL'
}

export interface AnalysisFailedMessage {
  type: 'STATUS_ANALYSIS_FAILED',
  payload: {
    error: Error
  }
}

export interface ModuleQueuedMessage {
  type: 'STATUS_MODULE_QUEUED',
  payload: {
    moduleName: string,
    workerId: number
  }
}

export interface ModuleSuccessfulMessage {
  type: 'STATUS_MODULE_SUCCESSFUL',
  payload: {
    moduleName: string,
    workerId: number
  }
}

export interface ModuleFailedMessage {
  type: 'STATUS_MODULE_FAILED',
  payload: {
    moduleName: string,
    workerId: number,
    error: Error
  }
}

export type StatusMessage =
  AnalysisStartedMessage
  | AnalysisSuccessfulMessage
  | AnalysisFailedMessage
  | ModuleQueuedMessage
  | ModuleSuccessfulMessage
  | ModuleFailedMessage

// FIXME: convert to string Enum
export const TYPES = {
  'STATUS_ANALYSIS_STARTED': 'STATUS_ANALYSIS_STARTED',
  'STATUS_ANALYSIS_SUCCESSFUL': 'STATUS_ANALYSIS_SUCCESSFUL',
  'STATUS_ANALYSIS_FAILED': 'STATUS_ANALYSIS_FAILED',
  'STATUS_MODULE_QUEUED': 'STATUS_MODULE_QUEUED',
  'STATUS_MODULE_SUCCESSFUL': 'STATUS_MODULE_SUCCESSFUL',
  'STATUS_MODULE_FAILED': 'STATUS_MODULE_FAILED',
};

export function analysisStarted(workerCount: number): AnalysisStartedMessage {
  return {
    type: 'STATUS_ANALYSIS_STARTED',
    payload: {
      workerCount
    }
  };
}

export function analysisSuccessful(): AnalysisSuccessfulMessage {
  return {
    type: 'STATUS_ANALYSIS_SUCCESSFUL'
  };
}

export function analysisFailed(error: Error): AnalysisFailedMessage {
  return {
    type: 'STATUS_ANALYSIS_FAILED',
    payload: {
      error
    }
  };
}

export function moduleQueued(moduleName: string, workerId: number): ModuleQueuedMessage {
  return {
    type: 'STATUS_MODULE_QUEUED',
    payload: {
      moduleName,
      workerId
    }
  };
}

export function moduleSuccessful(moduleName: string, workerId: number): ModuleSuccessfulMessage {
  return {
    type: 'STATUS_MODULE_SUCCESSFUL',
    payload: {
      moduleName,
      workerId
    }
  };
}

export function moduleFailed(moduleName: string, workerId: number, error: Error): ModuleFailedMessage {
  return {
    type: 'STATUS_MODULE_FAILED',
    payload: {
      moduleName,
      workerId,
      error
    }
  };
}
