const path = require('path');
const webpack = require('webpack');

const ANALYSIS_PATH = path.resolve(__dirname, 'dist', 'analysis.json');

async function compile(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      } else if (stats.hasErrors()) {
        // TODO: include the actual errors
        return reject(new Error('Compilation has errors'));
      } else {
        return resolve(stats);
      }
    });
  });
}

function getAnalysis() {
  return require(ANALYSIS_PATH);
}

describe('simple', () => {

  it('should compile a simple project', async () => {
    const config = require('./webpack.config');
    await compile(config);

    const analysis = getAnalysis();
    expect(analysis.modules).toBeDefined();
    expect(analysis.modules).toHaveLength(1);

    const indexModule = analysis.modules[0];
    expect(indexModule.name).toEqual('./src/index.js');
    expect(indexModule.shortName).toEqual('src/index.js');
    expect(indexModule.lines).toEqual(2);
  });

});
