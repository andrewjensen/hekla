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

const moduleQueued = (moduleName, workerId) => ({
  type: TYPES.STATUS_MODULE_QUEUED,
  payload: {
    moduleName,
    workerId
  }
});

const moduleSuccessful = (moduleName, workerId) => ({
  type: TYPES.STATUS_MODULE_SUCCESSFUL,
  payload: {
    moduleName,
    workerId
  }
});

const moduleFailed = (moduleName, workerId, error) => ({
  type: TYPES.STATUS_MODULE_FAILED,
  payload: {
    moduleName,
    workerId,
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
