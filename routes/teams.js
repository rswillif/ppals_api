var express = require('express');
var router = express.Router();
var appHelpers = require('../helpers/app-helpers');

// TODO: implement /teams
// TODO: implement /teams/:id

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

router.get('/', (req, res, next) => {
  var results = [];
  var id = req.query.id;
  var client = appHelpers.getConnectedClient();
  var query = null;

  query = client.query("SELECT id,title,body FROM teams;");

  // SQL Query > Select Data
  // if (id === "all") {
  //   query = client.query("SELECT title,body FROM teams;");
  // }
  // query = client.query({
  //   text: "SELECT title,body FROM teams WHERE id = $1;",
  //   values: [id]
  // });
  // Stream results back one row at a time
  query.on('row', (row) => {
    results.push(row);
  });
  // After all data is returned, close connection and return results
  query.on('end', () => {
    return res.json(results);
    client.end();
  });
    // res.json()
    // var id = result.rows[0].id;
    //
    // res.json({
    //   id: id,
    //   name: req.query.title,
    //   description: req.query.body
    // });
  // query.on('end', () => {
  //   client.end();
  // });
});

module.exports = router;
