'use strict';

const Homey = require('homey');
const { http } = require('./nbhttp');
const server = require('./node-sonos-http-api-master/server');

class SonosSay extends Homey.App {

	onInit() {
		this.log('SonosSay is running...');

		// Use local node-http
		this.host = "0.0.0.0";
		this.port = "5005";

		this.initializeActions();
		this.initializeServer();
	}
	
	initializeServer() {
		console.log('Initialize Server for node-sonos');
		var _server = server;
		
		
	}


	initializeActions() {
		
		var actionsCards = {};
		for (let actionCardIndex = 0; actionCardIndex < this.manifest.flow.actions.length; actionCardIndex++) {
			const actionCard = this.manifest.flow.actions[actionCardIndex];
			var card = new Homey.FlowCardAction(actionCard.id);			
			actionsCards[actionCard.id] = card;
			card.register();

			if(actionCard.args) {
				if(actionCard.args.find(x=>x.name=='speaker' && x.type=='autocomplete')) card.getArgument('speaker').registerAutocompleteListener(( query, args ) => {
						return new Promise((resolve) => {
							if (speakers == null){
								return this.error("Something is wrong with fetching speakers!");
							} else {
								this.getSpeakersList((error, speakers) => {
									if (error) {
										return this.error(error);
									}
									let result = [];
									if (typeof speakers.forEach != "function") { 
										return this.error("Something is wrong with fetching speakers!");
									} 
									if(speakers) speakers.forEach(entry => {
										const name = entry.coordinator.roomName;
										result.push({name: name, id: name});
									});
									resolve(result);
								})
							}
						});
					});
			}
		}

		actionsCards['action_sonos_lock_volume'].registerRunListener(( args, state ) => {
			return new Promise((resolve) => {
				this.lockVolume((error, result) => {
					if (error) return this.error(error);					
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_unlock_volume'].registerRunListener(( args, state ) => {
			return new Promise((resolve) => {
				this.unlockVolume((error, result) => {
					if (error) return this.error(error);
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_toggle_mute'].registerRunListener(( args, state ) => {
			return new Promise((resolve) => {
				this.toggleMute(args.speaker.id, (error, result) => {
					if (error) return this.error(error);
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_set_sleepmode'].registerRunListener(( args, state ) => {
			return new Promise((resolve) => {
				this.setSleepMode(args.speaker.id, args.timeout, (error, result) => {
					if (error) return this.error(error);
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_set_repeat_mode'].registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.setRepeatMode(args.speaker.id, args.repeatmode, (error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_enable_shuffle'].registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.enableShuffle(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		});
		
		actionsCards['action_sonos_disable_shuffle'].registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.disableShuffle(args.speaker.id, (error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		});
		
		actionsCards['action_sonos_enable_crossfade'].registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.enableCrossfade(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_disable_crossfade'].registerRunListener(( args, state ) => {
				return new Promise((resolve) => {
					this.disableCrossfade(args.speaker.id,(error, result) => {
						if (error) {
							return this.error(error);
						}
					resolve(true);
				})
			});
		});

		actionsCards['action_sonos_say'].registerRunListener(( args, state ) => {
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
		});

		/// New stuff
		actionsCards['action_sonos_say_url'].registerRunListener(( args, state ) => {
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
		});

		actionsCards['action_sonos_clear_queue'].registerRunListener(( args, state ) => {
			return new Promise((resolve) => {
				this.clearQueue(args.speaker.id,(error, result) => {
					if (error) return this.error(error);
					resolve(true);
			});
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
	
	clearQueue(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/clearqueue/`, (error, response) => {
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

	toggleMute(roomName, callback){
		http.get(`http://${Homey.app.host}:${Homey.app.port}/${roomName}/togglemute`, (error, response) => {
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