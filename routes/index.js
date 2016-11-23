var express = require('express');
var router = express.Router();
var indexHelpers = require('../helpers/index-helpers');
var appHelpers = require('../helpers/app-helpers');

var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.HEROKU_URL || "http://localhost:3000/auth"
);
// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];
var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as string
  scope: scopes
});

indexHelpers.getAdminTokens(function(tokens) {
  oauth2Client.credentials = tokens;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET google sign in page */
router.get('/sign_in', function(req, res, next) {
  res.redirect(url)
});

/* GET google oauth callback and auth code */
router.get('/auth', function(req, res, next) {
  // res.redirect(index)
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    indexHelpers.updateAdminTokens(tokens);

    oauth2Client.credentials = tokens
    // if (process.env.NODE_ENV === 'development') {
    //   res.redirect('/admin');
    // }
    if (process.env.NODE_ENV === 'production') {
      res.redirect('https://ppalsapi.herokuapp.com/admin');
    } else {
      res.redirect('/admin');
    }
    // res.redirect('/admin');
  })
});

/* GET supersecretadmin token password thing and attempt validation */
router.get('/events', function(req, res, next) {
  var upcomingEvents = [];
  if (appHelpers.isAdmin(req.query.password)) {
    // Fetch calendar events
      calendar.events.list({
        auth: oauth2Client,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          res.status(401).json('The API returned an error: ' + err);
          return;
        }
        var events = response.items;
        if (events.length == 0) {
          console.log('No upcoming events found.');
        } else {
          console.log('Upcoming 10 events:');
          for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var start = event.start.dateTime || event.start.date;
            var desired = { when: start, where: event.location, description: event.summary }
            console.log('%s - %s', start, event.summary);
            upcomingEvents[i] = desired;
          }
          res.json(upcomingEvents)
        }
      });
  } else {
    res.status(401).json("Invalid password!");
  }
});

module.exports = router;
