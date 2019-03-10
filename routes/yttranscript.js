var express = require('express');
var router = express.Router();
var fs = require('fs');

var videoData = require('../video_data_retrieval');
var transcript = require('../transcript_retrieval');

router.get('/', function(req, res, next){
  res.render('yttranscript/index');
});

router.post('/', function(req, res, next){
  console.log(req.body.url);

  if(req.body.url === undefined || req.body.url.length === 0) {
    return res.render('yttranscript/index', {error: "Please enter video URL"});
  }

  // Get video id from url
  var url = req.body.url.match(/[A-Za-z0-9_-]{11}/g);
  if(url === null) {
    return res.render('yttranscript/index', {error: "Could not find video ID from URL", url: req.body.url});
  }
  var videoId = url[0];

  // Check if file exists already
  var filename = 'public/transcripts/' + videoId + '.json';
  try {
    if(fs.existsSync(filename)) {
      console.log("File exists already.");
      return res.download(filename);
    }
  } catch(err) {
    console.error(err)
  }

  // Download data from yt
  videoData.get(videoId,
    function(vData) {
      transcript.get(vData, function(transcriptData){        
        // Save to file and download
        fs.writeFile(filename, JSON.stringify(transcriptData), function(err){
          if(err) throw err;
          return res.download(filename);
        });
      });
    },
    function(error) {
      return res.render('yttranscript/index', {url: req.body.url, error: "Error getting data!"});
    }
  );
});

module.exports = router;
