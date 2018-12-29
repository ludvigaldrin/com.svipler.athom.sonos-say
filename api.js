'use strict'
const Homey = require('homey');

module.exports = [{
    //http://<Your IP>/api/app/com.svipler.athom.sonos-say/say/
    description:	'Text for Sonos to Say',
    method: 		'PUT',
    path:			'/say/',
    requires_authorization: false,
    public:            true,
    fn: function(data, callback){

        Homey.app.apiDoSonosSay(data);
        
        callback(null, "OK");
        return;
    }
},{
    //http://<Your IP>/api/app/com.svipler.athom.sonos-say/info/
    description:	'Show Sonos Say Settings',
    method: 		'GET',
    path:			'/info/',
    requires_authorization: false,
    public:            true,
    fn: function(data, callback){

        Homey.app.apiGetSonosSaySettings(callback);
 
        return;
    }
}]