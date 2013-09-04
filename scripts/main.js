require(['$api/models', 'scripts/playlistHandler', 'scripts/dropHandler'],
function(models, playlistHandler, dropHandler) {
	'use strict';  
	dropHandler.init(playlistHandler);
});