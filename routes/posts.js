var express = require('express');
var router = express.Router();

/* GET all posts. */
router.get('/posts', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;
