const webpack = require('webpack');

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

describe('simple', () => {

  it('should compile a simple project', async () => {


    // TODO:
    // need to set a global timeout: https://github.com/facebook/jest/issues/652   maybe use setupTestFrameworkScriptFile
    // adjust .gitignore before checking everything in
    // clean up devDependencies that we won't actually use
    // Disable module reporters in the HeklaWebpackPlugin (split into a Hekla plugin?)

    const config = require('./webpack.config');
    await compile(config);

  });

});
