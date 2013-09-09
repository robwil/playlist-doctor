require(['$api/models', '$api/search'], function(models, search) {
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
			// Fetch tracks using snapshot API
			playlist.tracks.snapshot(0, maxItems).done(function(snapshot) {
				for (var i = 0, l = Math.min(snapshot.length, maxItems); i < l; i++) {
					var track = snapshot.get(i);
					var divId = "track" + i;
					
					// We only care about each unavailable track
					if (track.availability == 'unavailable') {
						var searchTerm = track.name + " " + track.artists[0].name;
						$('#messages').append("<div id='" + divId + "'><br/><strong>Unavailable: " + 
							trackToString(track) + "</strong><br/></div>");
						// Search using the track name and artist name of the Unavailable Track
						var mySearch = search.Search.search(searchTerm);
						mySearch.tracks.snapshot(0, maxItems).done(function(searchSnapshot) {
							for (var j = 0, k = Math.min(searchSnapshot.length, maxItems); j < k; j++) {
								// Output a list of the search term results as links which will replace the unavailable track
								var resultTrack = searchSnapshot.get(j);
								var trackLink = $("<a href='#'>" + trackToString(resultTrack) + "</a>");
								// Must use Closure to ensure the oldTrack and newTrack are available at replacement time
								// (i.e. when the user clicks the link)
								(function(oldTrack, newTrack, divToRemove) {
									trackLink.on('click', function(e) {
										// Since the user may have modified the original playlist before,
										// we have to fetch a new snapshot in order to remove the track.
										// (Not doing this will cause a subsequent delete to fail after a first one.)
										playlist.tracks.snapshot(0, maxItems).done(function(currentSnapshot) {
											playlist.tracks.remove(currentSnapshot.find(oldTrack)).fail(function(t, error) {
												console.log("Error while removing " + oldTrack.uri + ": " + error.message);
											});
										});
										// Add the new track in; doesn't need any snapshot work.
										playlist.tracks.add(newTrack);
										// Remove the DIV displaying the unavailable track and its search results
										$(divToRemove).remove();
									});
								})(track, resultTrack, '#'+divId);
								$('#' + divId).append(trackLink)
								$('#' + divId).append("<br/>");
							}
						});
					}
				}
			}).fail(function(){
				$("#dropbox").append('<p>Error trying to retrieve tracks from playlist' + "</p>");
			});
			$("#messages").append("<br/><br/>");
		}).fail(function() {
			$("#dropbox").append('<p>Error trying to retrieve playlist' + "</p>");
		});
	}; // end checkPlaylist() function

	exports.checkPlaylist = checkPlaylist;
});

//
// pad function
// @param n - the number to pad
// @param width - the desired width of the result string
// @param z - the character to use for padding (default is '0')
//
// Given a number n, pad it with zeros (or the provided z input character)
// up to a given width.
// e.g. This is used for outputing duration like 3:02 instead of 3:2.
// Reference: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
//
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//
// trackToString function
// @param track - the track to convert to string format
//
// Given a Track object, returns a pretty string version of it including
// the track and artist names, as well as the duration.
//
function trackToString(track) {
	return track.name + " - " + track.artists[0].name + " - " + durationToString(track.duration) + " (" + track.uri + ")";
}

//
// durationToString function
// @param duration - a track duration, specified in milliseconds
//
// Given a duration in milliseconds (how the Spotify API returns it),
// convert to a pretty string in the format MMM:SS.
//
function durationToString(duration) {
	var divmod = duration / 1000;
	var seconds = divmod % 60;
	var minutes = Math.floor(divmod / 60);
	return minutes + ":" + pad(seconds,2);
}