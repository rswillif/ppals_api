var express = require('express');
var router = express.Router();
var appHelpers = require('../helpers/app-helpers');

/* GET admin dashboard. */
router.get('/', function(req, res, next) {
  res.send('You are accessing the admin dashboard.');
});

router.post('/teams', (req, res, next) => {
  if (!appHelpers.isAdmin(req.body.password)) {
    res.status(401).end();
    return;
  }

  var name = req.body.name;
  var description = req.body.description;
  var image = req.files.image.data.toString('hex');

  var client = appHelpers.getConnectedClient();

  var query = client.query({
    text: "INSERT INTO teams (image, title, body) VALUES (decode($3, 'hex'), $1, $2) RETURNING id",
    values: [name, description, image]
  }, function(err, result) {
     if (err || result.rowCount !== 1) {
       res.status(400).end();
       return;
     }

     var id = result.rows[0].id;

     res.json({
       id: id,
       name: name,
       description: description
     });
  });

  query.on('end', () => {
    client.end();
  });
});

module.exports = router;
