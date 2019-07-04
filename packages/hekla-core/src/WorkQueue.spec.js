const WorkQueue = require('./WorkQueue');
const Module = require('./Module');

class MockAnalyzer {
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

    const rootPath = '/path/to/project';
    queue.enqueue(new Module('/path/to/project/src/truck.js', rootPath));
    queue.enqueue(new Module('/path/to/project/src/bus.js', rootPath));

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
