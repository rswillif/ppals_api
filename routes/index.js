var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var connectionString = process.env.DATABASE_URL;

var admin_password = process.env.ADMIN_PASSWORD;

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
var upcoming_events = {};

function getConnectedClient() {
  var connectionString = process.env.DATABASE_URL;

  var client = new pg.Client(connectionString);

  client.connect();

  return client;
}

function getAdminTokens() {
  var client = getConnectedClient();

  var query = client.query('SELECT tokens FROM admins WHERE id=1', function (err, result) {
    if (!err && result.rowCount === 1) {
      oauth2Client.credentials = JSON.parse(result.rows[0].tokens);
    }
  });

  query.on('end', () => {
    client.end();
  });
}

getAdminTokens();

function updateAdminTokens(tokens) {
  tokens = JSON.stringify(tokens);

  var client = getConnectedClient();

  var query = client.query(`do $$
begin
  INSERT INTO admins (id, tokens) VALUES (1, '${tokens}');
exception when unique_violation then
  UPDATE admins SET tokens = '${tokens}' WHERE id = 1;
end $$;`);

  query.on('end', () => {
    client.end();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET google sign in page */
router.get('/sign_in', function(req, res, next) {
  res.redirect(url)
})

/* GET google oauth callback and auth code */
router.get('/auth', function(req, res, next) {
  // res.redirect(index)
  oauth2Client.getToken(req.query.code, function(err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    console.log(tokens)

    updateAdminTokens(tokens);

    oauth2Client.credentials = tokens

    res.redirect('/admin');
  })
})

/* GET supersecretadmin token password thing and attempt validation */
router.get('/test', function(req, res, next) {
  if (req.query.password === admin_password) {
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
          res.status(401).json('The API returned an error: ' + err)
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
            upcoming_events[event.summary] = desired
          }
          res.json(upcoming_events)
        }
      });
  } else {
    res.status(401).json("Invalid password!")
  }
})

router.post('/upload', (req, res, next) => {
  var name = req.body.name;
  var description = req.body.description;
  var image = req.files.image.data.toString('hex');

  var client = getConnectedClient();

  var query = client.query({
    text: "INSERT INTO teams (image, title, body) VALUES (decode($3, 'hex'), $1, $2)",
    values: [name, description, image]
  });

  query.on('end', () => {
    client.end();

    res.send('created team');
  });
})

router.get('/download', (req, res, next) => {
  var id = req.query.id;

  var client = getConnectedClient();

  var query = client.query({
    text: "SELECT image FROM teams WHERE id = $1",
    values: [id]
  }, function (err, result) {
    if (!err && result.rowCount === 1) {
      res.writeHead(200, {'Content-Type': 'image/jpeg'});

      res.end(result.rows[0].image);
    } else {
      res.status(401).json('Failed to load image');
    }
  });

  query.on('end', () => {
    client.end();
  });
})

module.exports = router;
