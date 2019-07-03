const TYPES = {
  'STATUS_ANALYSIS_STARTED': 'STATUS_ANALYSIS_STARTED',
  'STATUS_ANALYSIS_SUCCESSFUL': 'STATUS_ANALYSIS_SUCCESSFUL',
  'STATUS_ANALYSIS_FAILED': 'STATUS_ANALYSIS_FAILED',
  'STATUS_MODULE_QUEUED': 'STATUS_MODULE_QUEUED',
  'STATUS_MODULE_SUCCESSFUL': 'STATUS_MODULE_SUCCESSFUL',
  'STATUS_MODULE_FAILED': 'STATUS_MODULE_FAILED',
};

const analysisStarted = (workerCount) => ({
  type: TYPES.STATUS_ANALYSIS_STARTED,
  payload: {
    workerCount
  }
});

const analysisSuccessful = () => ({
  type: TYPES.STATUS_ANALYSIS_SUCCESSFUL,
  payload: {}
});

const analysisFailed = (error) => ({
  type: TYPES.STATUS_ANALYSIS_FAILED,
  payload: {
    error
  }
});

const moduleQueued = (moduleName, workerIdx) => ({
  type: TYPES.STATUS_MODULE_QUEUED,
  payload: {
    moduleName,
    workerIdx
  }
});

const moduleSuccessful = (moduleName, workerIdx) => ({
  type: TYPES.STATUS_MODULE_SUCCESSFUL,
  payload: {
    moduleName,
    workerIdx
  }
});

const moduleFailed = (moduleName, workerIdx, error) => ({
  type: TYPES.STATUS_MODULE_FAILED,
  payload: {
    moduleName,
    workerIdx,
    error
  }
});

module.exports = {
  TYPES,
  analysisStarted,
  analysisSuccessful,
  analysisFailed,
  moduleQueued,
  moduleSuccessful,
  moduleFailed,
};
