require(['$api/models'], function(models) {
	'use strict';
	
	// Specify max amount of playlist tracks to load at once
	var maxItems = 15;
	
	//
	// checkPlaylist function
	// @param drop_url - the URL of the object which was dropped into the app
	//
	// Use the URL of the dropped object to attempt to load a Playlist and its tracks.
	// If successful, display list of tracks marked "unavailable".
	//
	
	var checkPlaylist = function(drop_url) {
		// Start with clean slate
		$("#dropbox").empty();
		$("#messages").empty();
		
		// Diagnostic message
		$("#dropbox").append('<p>Dropped URL: ' + drop_url + '</p>');
		
		// Attempt to load the Playlist from URL - we are fetching Playlist's name and tracks
		models.Playlist.fromURI(drop_url).load('name', 'tracks').done(function(playlist) {
			$("#dropbox").append('<p>Successfully loaded playlist: ' + playlist.name + "</p>");
			$("#messages").append("<h2>Playlist: " + playlist.name + "</h2>");
			$("#messages").append("<ul>");
			// Fetch tracks using snapshot API
			playlist.tracks.snapshot(0, maxItems).done(function(snapshot) {
				for (var i = 0, l = Math.min(snapshot.length, maxItems); i < l; i++) {
					var track = snapshot.get(i);
					// For each "unavailable" track, print its information to page
					if (track.availability == 'unavailable') {
						$('#messages').append("<li>" + track.name + " - " + track.artists[0].name + " - " + track.availability + "</li>");
					}
				}
			}).fail(function(){
				$("#dropbox").append('<p>Error trying to retrieve tracks from playlist' + "</p>");
			});
			$("#messages").append("</ul><br/><br/>");
		}).fail(function() {
			$("#dropbox").append('<p>Error trying to retrieve playlist' + "</p>");
		});
	}; // end checkPlaylist() function

	exports.checkPlaylist = checkPlaylist;
});
