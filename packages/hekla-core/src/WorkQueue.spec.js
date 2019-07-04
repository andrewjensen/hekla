const WorkQueue = require('./WorkQueue');
const Module = require('./Module');

class MockAnalyzer {
  // TODO: remove from mock after changing the interface
  createModule(resource) {
    return new Module(resource, '/path/to/project');
  }

  async processModule(module) {
    await sleep(10);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('WorkQueue', () => {

  it('sends status updates', async () => {
    const messages = [];

    const analyzer = new MockAnalyzer();
    const queue = new WorkQueue(analyzer);
    queue.onStatusUpdate(statusMessage => {
      messages.push(statusMessage);
    });
    queue.start(2);

    queue.enqueue('truck.js', '/path/to/project/src/truck.js');
    queue.enqueue('bus.js', '/path/to/project/src/bus.js');

    await queue.waitForFinish();

    expect(messages).to.deep.equal([
      {
        type: 'STATUS_MODULE_QUEUED',
        payload: {
          moduleName: './src/truck.js',
          workerId: 0
        }
      },
      {
        type: 'STATUS_MODULE_QUEUED',
        payload: {
          moduleName: './src/bus.js',
          workerId: 1
        }
      },
      {
        type: 'STATUS_MODULE_SUCCESSFUL',
        payload: {
          moduleName: './src/truck.js',
          workerId: 0
        }
      },
      {
        type: 'STATUS_MODULE_SUCCESSFUL',
        payload: {
          moduleName: './src/bus.js',
          workerId: 1
        }
      }
    ]);
  });

});
