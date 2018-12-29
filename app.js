'use strict';

const Homey = require('homey');
const Request = require('request');

var sonoshttp = "";
var language = "en-US";
var volume = "40";

class SonosSay extends Homey.App {

	onInit() {
		this.log('SonosSay is running...');
	}

	apiDoSonosSay(data){
		console.log(data);
		doSonosSay(data.body.text);
	}

	apiGetSonosSaySettings(callback){
		doGetSonosSaySettings(callback);
	}

}

module.exports = SonosSay;

let actionSonosSay = new Homey.FlowCardAction('action_sonos_to_say');
actionSonosSay.register().registerRunListener((args, state) => {
	doSonosSay(args.sonossay);
	return true;
});

function doSonosSay(text) {
	getSonosSaySettings();

	console.log("Settings - Sonos HTTP: %s Language: %s Volume: %s", sonoshttp, language, volume);
	console.log('Flow Say to Sonos: %s', text);

	Request(sonoshttp+"sayall/"+text+"/"+language+"/"+volume, { json: false }, (err, res, body) => {
		if (err) { return console.log(err); }
		//console.log(body.url);
		//console.log(body.explanation);
		console.log("Sonos Say Done");

	});

}

function doGetSonosSaySettings(callback){
	getSonosSaySettings();
	var result = '{"sonoshttp":"' + sonoshttp + '","language":"' + language  + '","volume:","'+volume+'"}';
	callback(null, result);
}

function getSonosSaySettings() {
	sonoshttp = Homey.ManagerSettings.get('sonoshttp');
	language = Homey.ManagerSettings.get('language');
	volume = Homey.ManagerSettings.get('volume');
}