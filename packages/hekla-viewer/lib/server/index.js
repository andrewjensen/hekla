'use strict';

const path = require('path');
const express = require('express');

const buildPath = path.resolve(__dirname, '../../build');

module.exports = class ViewerServer {
  constructor(heklaData) {
    const app = express();

    app.get('/', (req, res) => res.sendFile(path.resolve(buildPath, 'index.html')));

    app.use('/static', express.static(path.resolve(buildPath, 'static')));

    app.get('/hekla.json', (req, res) => res.json(heklaData));

    this._server = app;
  }

  listen(port) {
    return new Promise((resolve, reject) => {
      this._server.listen(port, (err) => {
        if (err) return reject(err);

        return resolve();
      });
    });
  }
};
