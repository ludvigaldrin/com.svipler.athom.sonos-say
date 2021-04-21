'use strict';
const http = require('http');
const SonosSystem = require('sonos-discovery');
const SonosHttpAPI = require('./lib/sonos-http-api.js');
const settings = require('./settings');
const nodeStatic = require('node-static');
const fileServer = new nodeStatic.Server(settings.webroot);

const discovery = new SonosSystem(settings);
const sonos_api = new SonosHttpAPI(discovery, settings);

// setting up file server for sonos to receive the audio files

var requestHandler = function (req, res) {
    req.addListener('end', function () {
        fileServer.serve(req, res, function (err) {
        });
    }).resume();
};

let server;
server = http.createServer(requestHandler);

process.on('unhandledRejection', (err) => {
});

let host = settings.ip;
server.listen(settings.port, host, function () {
});

server.on('error', (err) => {
    process.exit(1);
});

module.exports = sonos_api;
