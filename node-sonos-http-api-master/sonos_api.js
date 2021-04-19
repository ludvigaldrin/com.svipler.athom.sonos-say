'use strict';
const SonosSystem = require('sonos-discovery');
const SonosHttpAPI = require('./lib/sonos-http-api.js');
const nodeStatic = require('node-static');
const settings = require('./settings');

const fileServer = new nodeStatic.Server(settings.webroot);
const discovery = new SonosSystem(settings);
const sonos_api = new SonosHttpAPI(discovery, settings);

var requestHandler = function (req, res) {
  req.addListener('end', function () {
    fileServer.serve(req, res, function (err) {
      if (req.method === 'GET') {
        api.requestHandler(req, res);
      }
    });
  }).resume();
};

module.exports = sonos_api;
