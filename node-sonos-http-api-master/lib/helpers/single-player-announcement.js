'use strict';
const logger = require('sonos-discovery/lib/helpers/logger');
const { Defer } = require('../../../lib/proto');
const isRadioOrLineIn = require('../helpers/is-radio-or-line-in');
const backupPresets = {};

function singlePlayerAnnouncement(player, uri, volume, duration) {
// Create backup preset to restore this player
  const state = player.state;
  const system = player.system;

  let groupToRejoin;

  const backupPreset = {
    players: [
      { roomName: player.roomName, volume: state.volume }
    ]
  };

  if (player.coordinator.uuid == player.uuid) {
    // This one is coordinator, you will need to rejoin
    // remember which group you were part of.
    const group = system.zones.find(zone => zone.coordinator.uuid === player.coordinator.uuid);
    
    if (group.members.length > 1) {
      console.log('Think its coordinator, will find uri later');
      
      // console.log(player.avTransportUri);
      // console.log(player.avTransportUriMetadata);

      groupToRejoin = group.id;
      backupPreset.group = group.id;
      backupPreset.spdif = player.avTransportUri.indexOf('spdif')>-1;
      if(backupPreset.spdif) {
        backupPreset.state = state.playbackState;
        backupPreset.metadata = player.avTransportUriMetadata;
        backupPreset.playMode = {
          repeat: 'none'
        };
      }
    } else {
      
      console.log('Think its no coordinator');
      // was stand-alone, so keep state
      backupPreset.state = state.playbackState;
      backupPreset.uri = player.avTransportUri;
      backupPreset.metadata = player.avTransportUriMetadata;
      backupPreset.playMode = {
        repeat: state.playMode.repeat
      };

      if (!isRadioOrLineIn(backupPreset.uri)) {
        backupPreset.trackNo = state.trackNo;
        backupPreset.elapsedTime = state.elapsedTime;
      }

    }
  } else {
    // console.log('else');
    // console.log(player.avTransportUri);
    // console.log(player.avTransportUriMetadata);
    // Was grouped, so we use the group uri here directly.
    backupPreset.spdif = player.avTransportUri.indexOf('spdif')>-1;
      if(backupPreset.spdif) {
        backupPreset.state = state.playbackState;
        backupPreset.metadata = player.avTransportUriMetadata;
        backupPreset.playMode = {
          repeat: 'none'
        };
      }
      backupPreset.uri = `x-rincon:${player.coordinator.uuid}`;// + (player.avTransportUri.indexOf('spdif')>-1 ? ':spdif' : '');
      backupPreset.uriSpdif = `x-rincon:${player.coordinator.uuid}` + (player.avTransportUri.indexOf('spdif')>-1 ? ':spdif' : '');
  }

  logger.debug('backup state was', backupPreset);

// Use the preset action to play the tts file
  var ttsPreset = {
    players: [
      { roomName: player.roomName, volume }
    ],
    playMode: {
      repeat: false
    },
    uri
  };

  let abortTimer;

  if (!backupPresets[player.roomName]) {
    backupPresets[player.roomName] = [];
  }

  backupPresets[player.roomName].unshift(backupPreset);
  logger.debug('backup presets array', backupPresets[player.roomName]);

  const prepareBackupPreset = () => {
    if (backupPresets[player.roomName].length > 1) {
      backupPresets[player.roomName].shift();
      logger.debug('more than 1 backup presets during prepare', backupPresets[player.roomName]);
      return Promise.resolve();
    }

    if (backupPresets[player.roomName].length < 1) {
      return Promise.resolve();
    }

    const relevantBackupPreset = backupPresets[player.roomName][0];

    logger.debug('exactly 1 preset left', relevantBackupPreset);

    console.log('relevantBackupPreset');
    console.log(relevantBackupPreset);
    if (relevantBackupPreset.group) {
      console.log('relevantBackupPreset.group');
      const zone = system.zones.find(zone => zone.id === relevantBackupPreset.group);
      console.log('relevantBackupPreset.zone');
      if (zone) {
          
          relevantBackupPreset.uri = `x-rincon:${zone.uuid}`;// + (relevantBackupPreset.spdif ? ':spdif' : '');
          console.log('relevantBackupPreset.uri');
          console.log(relevantBackupPreset.uri );
          relevantBackupPreset.uriSpdif  = relevantBackupPreset.spdif ? `x-sonos-htastream:${zone.uuid}` +':spdif' : null;
          //relevantBackupPreset.uri = `x-sonos-htastream:${zone.uuid}` + (relevantBackupPreset.spdif ? ':spdif' : '');
      }
    }
    //delete relevantBackupPreset.spdif;
    
    logger.debug('applying preset', relevantBackupPreset);
    console.log('applying preset');
    console.log(relevantBackupPreset);
    var relevantBackupPreset2 = relevantBackupPreset.uriSpdif ? {
      players: relevantBackupPreset.players,
      state: relevantBackupPreset.state,
      uri: 'x-sonos-htastream:' + player.uuid + ':spdif',
      metadata: '',
      playMode: { repeat: 'none' }
    } : null;
    
    console.log('relevantBackupPreset 2e');          
    console.log(relevantBackupPreset2);
    var defer = new Defer();
    if(relevantBackupPreset2) return system.applyPreset(relevantBackupPreset2).then(x=> {
      
      const zone = system.zones.find(zone => zone.id === relevantBackupPreset.group);
      // connect each device from the "zone" again...
      if(zone) zone.members.forEach(member => {
        attachTo(member, player );
      });
      defer.resolve() ;

      function rinconUri(player) {
        return `x-rincon:${player.uuid}`;
      }
      
      function attachTo(player, coordinator) {
        console.log('attachTo');
        console.log(player);
        console.log(coordinator);
        return player.setAVTransport(rinconUri(coordinator));
      }
      
    });
    else r().then(()=>{defer.resolve(); });

    return defer.promise;
    function r() {
      console.log('r');
      console.log(r);
      return system.applyPreset(relevantBackupPreset)
        .then(() => {
          backupPresets[player.roomName].shift();
          logger.debug('after backup preset applied', backupPresets[player.roomName]);
      
      
        //   if(relevantBackupPreset2) {
        //     console.log(player.uuid);
        //     relevantBackupPreset.uri = 'x-rincon-stream:RINCON_949F3E67D30101400';//relevantBackupPreset.uriSpdif; //:spdif
        //     //const uri = `x-rincon-stream:${lineinSourcePlayer.uuid}`;
        //     delete relevantBackupPreset.group;
        //     console.log('relevantBackupPreset 2e');          
        //     console.log(relevantBackupPreset);
        //     system.applyPreset(relevantBackupPreset);
        //   }
          
        });
    }
  }

  let timer;
  const restoreTimeout = duration + 2000;
  return system.applyPreset(ttsPreset)
    .then(() => {
      return new Promise((resolve) => {
        const transportChange = (state) => {
          logger.debug(`Player changed to state ${state.playbackState}`);
          if (state.playbackState === 'STOPPED') {
            return resolve();
          }

          player.once('transport-state', transportChange);
        };
        setTimeout(() => {
          player.once('transport-state', transportChange);
        }, duration / 2);

        logger.debug(`Setting restore timer for ${restoreTimeout} ms`);
        timer = Date.now();
        abortTimer = setTimeout(resolve, restoreTimeout);
      });
    })
    .then(() => {
    const elapsed = Date.now() - timer;
    logger.debug(`${elapsed} elapsed with ${restoreTimeout - elapsed} to spare`);
      clearTimeout(abortTimer);
    })
    .then(prepareBackupPreset)
    .catch((err) => {
      logger.error(err);
      return prepareBackupPreset()
        .then(() => {
          throw err;
        });
    });
}

module.exports = singlePlayerAnnouncement;
