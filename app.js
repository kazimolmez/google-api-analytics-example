var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var analytics = google.analytics('v3');
var express = require('express');
var app = express();
var oauth2Client = new OAuth2(
    'url',
    'secret',
    'http://localhost:1234/return'
);
google.options({
    auth: oauth2Client
});
// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
    'https://www.googleapis.com/auth/analytics.readonly'
];
var url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // Optional property that passes state parameters to redirect URI
    // state: { foo: 'bar' }
});

app.use('/return', function(req, res) {
    oauth2Client.getToken(req.query.code, function(err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (err) console.log(err);
        res.json({ code: req.query.code, tokens });
    });
})

app.use('/sign', function(req, res) {
    res.redirect(url);
})

app.use('/show', function(req, res) {
    oauth2Client.setCredentials({
        access_token: 'token',
        //refresh_token: 'REFRESH TOKEN HERE'
        // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
        // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
    });
    analytics.data.realtime.get({
        auth: oauth2Client,
        ids: 'ga:131567885',
        metrics: 'rt: activeUsers'
    }, function(err, response) {
        if (err) console.log(err);
        res.json(response)
    });
});

app.use('/', function(req, res) {
    res.json({ 'your': 'welcome' });
})

app.listen(1234);