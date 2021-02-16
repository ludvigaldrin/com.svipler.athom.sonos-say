'use strict';

const Homey = require('homey');
const { http } = require('./nbhttp');
const server = require('./node-sonos-http-api-master/server');

class SonosSay extends Homey.App {

	onInit() {
		this.log('SonosSay is running...');

		this.host = Homey.ManagerSettings.get('host');
		this.port = Homey.ManagerSettings.get('port');

		if (!this.host || !this.port) {
			return this.log('Go to the app settings page and fill all the fields');
		}

		this.initializeActions();

		this.initializeServer();
	}
	
	initializeServer() {
		console.log('initializeServer');
		var _server = server;
		
		
	}


	initializeActions() {

		let lockVolumeAction = new Homey.FlowCardAction('action_sonos_lock_volume');
		lockVolumeAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.lockVolume((error, result) => {
						if (error) {
							return this.error(error);
						}
						resolve(true);
					})
				});
			});

		let unlockVolumeAction = new Homey.FlowCardAction('action_sonos_unlock_volume');
			unlockVolumeAction
				.register()
				.registerRunListener(( args, state ) => {
					return new Promise((resolve) => {
						this.unlockVolume((error, result) => {
							if (error) {
								return this.error(error);
							}
							resolve(true);
						})
					});
				});

		let setSleepmodeAction = new Homey.FlowCardAction('action_sonos_set_sleepmode');
		setSleepmodeAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.setSleepMode(args.speaker.id, args.timeout, (error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let setRepeatMode = new Homey.FlowCardAction('action_sonos_set_repeat_mode');
		setRepeatMode
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.setRepeatMode(args.speaker.id, args.repeatmode, (error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let enableShuffleAction = new Homey.FlowCardAction('action_sonos_enable_shuffle');
		enableShuffleAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.enableShuffle(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let disableShuffleAction = new Homey.FlowCardAction('action_sonos_disable_shuffle');
		disableShuffleAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.disableShuffle(args.speaker.id, (error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let enableCrossfadeAction = new Homey.FlowCardAction('action_sonos_enable_crossfade');
		enableCrossfadeAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.enableCrossfade(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let disableCrossfadeAction = new Homey.FlowCardAction('action_sonos_disable_crossfade');
		disableCrossfadeAction
			.register()
			.registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.disableCrossfade(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		})
		.getArgument('speaker')
		.registerAutocompleteListener(( query, args ) => {
			return new Promise((resolve) => {
				this.getSpeakersList((error, speakers) => {
					if (error) {
						return this.error(error);
					}
					let result = [];
					speakers.forEach(entry => {
						const name = entry.coordinator.roomName;
						result.push({name: name, id: name});
					});
					resolve(result);
				})
			});
		});

		let sayAction = new Homey.FlowCardAction('action_sonos_say');
		sayAction
			.register()
			.registerRunListener(( args, state ) => {
				if(args.speaker.id === '-'){
					return new Promise((resolve) => {
						this.sayAll(args.text, args.volume, args.language, (error, result) => {
							if (error) {
								return this.error(error);
							}
							resolve(true);
						})
					});
				} else {
					return new Promise((resolve) => {
						this.say(args.speaker.id, args.text, args.volume, args.language, (error, result) => {
							if (error) {
								return this.error(error);
							}
							resolve(true);
						})
					});
				}
			})
			.getArgument('speaker')
			.registerAutocompleteListener(( query, args ) => {
				return new Promise((resolve) => {
					this.getSpeakersList((error, speakers) => {
						if (error) {
							return this.error(error);
						}
						let result = [{ name: 'All Speakers', id: '-'}];
						speakers.forEach(entry => {
							const name = entry.coordinator.roomName;
							result.push({name: name, id: name});
						});
						resolve(result);
					})
				});
			});



		let sayUrlAction = new Homey.FlowCardAction('action_sonos_say_url');
		sayUrlAction
			.register()
			.registerRunListener(( args, state ) => {
				if(args.speaker.id === '-'){
					return new Promise((resolve) => {
						this.sayAllUrl(args.url, args.volume, args.durationAudio, (error, result) => {
							if (error) {
								return this.error(error);
							}
							resolve(true);
						})
					});
				} else {
					return new Promise((resolve) => {
						console.log('args');
						console.log(args);
						this.sayUrl(args.speaker.id, args.url, args.volume, args.durationAudio, (error, result) => {
							if (error) {
								return this.error(error);
							}
							resolve(true);
						})
					});
				}
			})
			.getArgument('speaker')
			.registerAutocompleteListener(( query, args ) => {
				return new Promise((resolve) => {
					this.getSpeakersList((error, speakers) => {
						if (error) {
							return this.error(error);
						}
						let result = [{ name: 'All Speakers', id: '-'}];
						speakers.forEach(entry => {
							const name = entry.coordinator.roomName;
							result.push({name: name, id: name});
						});
						resolve(result);
					})
				});
			});

	}
	


	getSpeakersList(callback) {
		http.get(`http://${Homey.app.host}:${Homey.app.port}/zones`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	say(roomName, text, volume, language, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/say/${encodeURI(text)}/${language}/${volume}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	sayUrl(roomName, url, volume, duration, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/sayurl/${Buffer.from(url).toString('base64')}/${volume}/${duration}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}
	sayAllUrl(url, volume, duration, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/sayallurl/${Buffer.from(url).toString('base64')}/${volume}/${duration}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	sayAll(text, volume, language, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/sayall/${encodeURI(text)}/${language}/${volume}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	lockVolume(callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/lockvolumes`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	unlockVolume(callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/unlockvolumes`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	setSleepMode(roomName, duration, callback){
		if(duration <= 0){
			duration = 'off';
		}
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/sleep/${duration}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	setRepeatMode(roomName, repeatMode, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/repeat/${repeatMode}`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	enableShuffle(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/shuffle/on`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	disableShuffle(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/shuffle/off`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	enableCrossfade(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/crossfade/on`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}

	disableCrossfade(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/crossfade/off`, (error, response) => {
			callback(error, !!error ? null : JSON.parse(response))
		})
	}
}

module.exports = SonosSay;