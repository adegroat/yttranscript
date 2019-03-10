var express = require('express');
var router = express.Router();
var fs = require('fs');

var videoData = require('../video_data_retrieval');
var transcript = require('../transcript_retrieval');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/download', function(req, res, next){
  if(req.query.url === undefined) {
    return res.render('index', {error: "Please enter video URL"});
  }

  // Get video id from url
  var url = req.query.url.match(/[A-Za-z0-9_-]{11}/g);
  if(url === null) {
    return res.render('index', {error: "Could not find video ID from URL", url: req.query.url});
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
      return res.render('index', {url: req.query.url, error: "Error getting data!"});
    }
  );
});

module.exports = router;
