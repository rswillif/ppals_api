var express = require('express');
var router = express.Router();
var pg = require('pg');
var path = require('path');
var connectionString = process.env.DATABASE_URL;

var admin_password = process.env.ADMIN_PASSWORD;


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET all posts. */
router.get('/posts', (req, res, next) => {

});

module.exports = router;
