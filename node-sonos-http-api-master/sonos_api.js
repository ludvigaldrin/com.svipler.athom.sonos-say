'use strict';
const SonosSystem = require('sonos-discovery');
const SonosHttpAPI = require('./lib/sonos-http-api.js');
const settings = require('./settings');

const discovery = new SonosSystem(settings);
const sonos_api = new SonosHttpAPI(discovery, settings);

module.exports = sonos_api;
