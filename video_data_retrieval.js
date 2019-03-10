var https = require('https');

function getVideoData(videoId, callback, errorCallback = function(){}) {
    var ytData = "";
    var videoData = {};

    const options = {
        hostname: 'www.youtube.com',
        path: '/watch?v=' + videoId,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
            'Content-Type': 'text/html'
        }
    };

    https.get(options, function(res) {
        var cookies = res.headers['set-cookie'];

        for(var i = 0; i < cookies.length; i++) {
            var subCookies = cookies[i].split(";");
            for(var j = 0; j < subCookies.length; j++) {
                var cookiePair = subCookies[j].split("=");
                
                if(cookiePair.indexOf("YSC") !== -1) {
                    videoData.ysc = cookiePair[1];
                }

                if(cookiePair.indexOf("VISITOR_INFO1_LIVE") !== -1) {
                    videoData.visitorInfoLive = cookiePair[1];
                }
            }
        }

        res.on('data', function(resData){
            ytData += resData;
        });

        res.on('end', function(){
            try{
                videoData.params = (/getTranscriptEndpoint":{"params":"([^\"]{1,})"}},"trackingParams/g).exec(ytData)[1]; //reg[1]
                videoData.clickTrackingParams = (/getTranscriptEndpoint":{"params":"[^\"]{1,}"}},"trackingParams":"([^\"]{1,})"}},/).exec(ytData)[1];
                videoData.sessionToken = (/"XSRF_TOKEN":"([^\"]{1,})"/g).exec(ytData)[1];
                videoData.csn = (/"EVENT_ID":"([^\"]{1,})"/g).exec(ytData)[1];
            } catch(err) {
                errorCallback(err);
                return;
            }
            callback(videoData);
        });
    });
}

module.exports.get = getVideoData;