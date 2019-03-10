var https = require('https');

function getTranscriptData(videoData, callback) {
    var responseData = "";

    // "sej" ???
    var sej = {
        clickTrackingParams: videoData.clickTrackingParams,
        commandMetadata: {'webCommandMetadata':{'url':'/service_ajax','sendPost':true}},
        getTranscriptEndpoint:{
            params: videoData.params
        }
    };

    var postData = "sej="+JSON.stringify(sej)+"&csn="+videoData.csn+"&session_token="+videoData.sessionToken;

    var postOptions = {
        hostname: 'www.youtube.com',
        path: '/service_ajax?name=getTranscriptEndpoint',
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Accept': '*/*',
            'Cookie': 'YSC=' + videoData.ysc + '; VISITOR_INFO1_LIVE=' + videoData.visitorInfoLive
        }
    };

    var req = https.request(postOptions, function(res){
        res.on('data', function(data){
            responseData += data;
        });

        res.on('end', function(){
            var output = [];

            responseData = JSON.parse(responseData);

            var data = responseData.data.actions[0].openTranscriptAction.transcriptRenderer.transcriptRenderer.body.transcriptBodyRenderer.cueGroups;

            for(var i = 0; i < data.length; i++) {
                var line = {};

                var cues = data[i].transcriptCueGroupRenderer.cues;
                line.timestamp = data[i].transcriptCueGroupRenderer.formattedStartOffset.simpleText;
                
                for(var j = 0; j < cues.length; j++) {
                    line.text = cues[j].transcriptCueRenderer.cue.simpleText;
                }
                
                output.push(line);                
            }

            callback(output);
        });
    });

    req.on('error', function(err){
        console.log("ERROR: ", err.message);
    });

    req.write(postData);
    req.end();
};

module.exports.get = getTranscriptData;