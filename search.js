module.exports = {
  getArt: function (artist, track) {
  /**
   * Example that executes a Spotify "Search" and parses the XML results using
   * node-xml2js.
   */

  readPlaying();

  var xml2js = require('xml2js');
  var Spotify = require('spotify-web');
  var superagent = require('superagent');
  var query = "";

  var path = require('path');

  var filePath = path.join(__dirname + '/NowPlaying.txt');

  fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      if (!err) {
        query = data.replace(/^\s+|\s+$/g, '');
        console.log(query);
      } else {
          console.log(err);
      }

  });

  // Spotify credentials...
  var username = process.env.SPOTIFY_USERNAME;
  var password = process.env.SPOTIFY_PASSWORD;

  Spotify.login(username, password, function (err, spotify) {
    if (err) throw err;

    spotify.search(query, function (err, xml) {
      if (err) throw err;
      spotify.disconnect();

      var parser = new xml2js.Parser();
      parser.on('end', function (data) {
        var album_uri;
        var open = require('open');
        try {
          // Check Album for Art
          album_uri = data.result.albums[0].album[0].cover[0];
          console.log(spotify.sourceUrls.small + album_uri);
          // open(spotify.sourceUrls.small + album_uri);

          download(spotify.sourceUrls.small + album_uri, 'Cover.png', function(){
            console.log('done');
          });
        }
        catch (ignore) {
          console.log("Album art not found. Checking song art...");
          try {
            // Check Song for Art
            album_uri = data.result.tracks[0].track[0].cover[0];
            console.log(spotify.sourceUrls.small + album_uri);
            // open(spotify.sourceUrls.small + album_uri);

            download(spotify.sourceUrls.small + album_uri, 'Cover.png', function(){
              console.log('done');
            });
          }
          catch (ignore2) {
            console.log("Can't find any art...");
          }
          
        }
      });
      parser.parseString(xml);
    });

  });
}
}


// http://stackoverflow.com/questions/12828187/saving-an-image-file-with-node-js-request-library-causes-exception
var fs = require('fs'),
request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


function getInfo() {
  var LastfmAPI = require ('lastfmAPI');

  var lfm = new LastfmAPI({
      'api_key' : process.env.LASTFM_API_KEY,
      'secret' : process.env.LASTFM_SECRET
  });

  // var user = "fathomx9";
  var artist = "";
  var track = "";
  lfm.user.getRecentTracks({
    'user': process.env.LASTFM_USERNAME
  }, function (err, track) {
      if (err) { 
        console.log(err);
        throw err; }
      // console.log(track.track[0]);
      artist = track.track[0].artist["#text"];
      track = track.track[0].name;
      // console.log(artist);
      // console.log(track);
      // console.log(track.track[0].image[3]["#text"])
      getArt(artist, track);
  });

}