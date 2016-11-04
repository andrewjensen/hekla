'use strict';

const path = require('path');

const ViewerServer = require('hekla-viewer');

const DEFAULT_FILENAME = 'hekla.json';

module.exports = function view(filename, options) {
  let json;
  const correctedFilename = (filename === undefined ? DEFAULT_FILENAME : filename);
  const filePath = path.resolve(process.cwd(), correctedFilename);
  const port = options.port;

  try {
    json = require(filePath);
  } catch (err) {
    console.error('Could not load Hekla analysis file:', err);
    process.exit(1);
  }

  const viewerServer = new ViewerServer(json);
  viewerServer
    .listen(port)
    .then(() => {
      console.log(`Server listening on port ${port}.`);
    })
    .catch(err => {
      console.log('Error starting server:', err);
      process.exit(1);
    });
};
