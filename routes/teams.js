var express = require('express');
var router = express.Router();
var appHelpers = require('../helpers/app-helpers');

// TODO: implement /teams
// TODO: implement /teams/:id

router.get('/:id/image', (req, res, next) => {
  var id = req.params.id;

  var client = appHelpers.getConnectedClient();

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
});

module.exports = router;
