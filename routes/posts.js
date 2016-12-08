var express = require('express');
var router = express.Router();
var appHelpers = require('../helpers/app-helpers');

/* GET all posts. */
router.get('/', (req, res, next) => {
  var client = appHelpers.getConnectedClient();
  var results = []
  var query = null;

  query = client.query("SELECT id,date,title,body FROM posts;")

  query.on('row', (row) => {
    results.push(row);
  });

  query.on('end', () => {
    return res.json(results);
    client.end();
  });
});

module.exports = router;
