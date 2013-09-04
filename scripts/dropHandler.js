require(['$api/models'], function(models) {
	'use strict';
	
	//
	// init function
	// @param playlistHandler - the playlistHandler class which encapsulated the main playlist fixing logic
	//
	// Set up several event handlers to handle drag-and-drop events within the app.
	//
	
	var init = function(playlistHandler) {
		// (all of this code below is from Spotify API Demo, branch 1.0 https://github.com/spotify/apps-tutorial)
		
		// Handle drops within the #dropbox DIV
		var dropBox = document.querySelector('#dropbox');
		dropBox.addEventListener('dragstart', function(e){
			e.dataTransfer.setData('text/html', this.innerHTML);
			e.dataTransfer.effectAllowed = 'copy';
		}, false);

		dropBox.addEventListener('dragenter', function(e){
			if (e.preventDefault) e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			this.classList.add('over');
		}, false);

		dropBox.addEventListener('dragover', function(e){
			if (e.preventDefault) e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			return false;
		}, false);

		dropBox.addEventListener('drop', function(e){
			if (e.preventDefault) e.preventDefault();
			var drop = models.Playlist.fromURI(e.dataTransfer.getData('text'));
			this.classList.remove('over');		
			playlistHandler.checkPlaylist(drop.uri);
		}, false);
		
		// Handle drops into the app from sidebar
		models.application.addEventListener('dropped', function(){
			playlistHandler.checkPlaylist(models.application.dropped[0].uri);
		});
		
	}; // end function init()
	
	exports.init = init;
});