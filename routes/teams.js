var express = require('express');
var router = express.Router();
var appHelpers = require('../helpers/app-helpers');

/* Gets and returns the rendered picture for a team */
router.get('/:id/image', (req, res, next) => {
  var id = req.params.id;

  var client = appHelpers.getConnectedClient();

  var query = client.query({
    text: "SELECT image FROM teams WHERE id = $1;",
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
});

/* Gets and returns all teams */
router.get('/', (req, res, next) => {
  var results = [];
  var id = req.query.id;
  var client = appHelpers.getConnectedClient();
  var query = null;

  query = client.query("SELECT id,title,body FROM teams;");

  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });

  // After all data is returned, close connection and return results
  query.on('end', () => {
    return res.json(results);
    client.end();
  });
});

/* Get a team by id */
router.get('/:id', (req, res, next) => {
  var results = [];
  var id = req.params.id;
  var client = appHelpers.getConnectedClient();
  var query = null;

  query = client.query({
    text: "SELECT id,title,body FROM teams WHERE id = $1;"
    values: [id]
  }, function (err, result) {
    res.status(401).json('Team with desired id DNE or is invalid.');
  });

  // Stream results at selected row back to results variable
  query.on('row', (row) => {
    results.push(row);
  });

  // After data is returned from db and assigned, close connection and return results
  query.on('end', () => {
    return res.json(results);
    client.end();
  });
});

module.exports = router;
