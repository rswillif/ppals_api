var pg = require('pg');

var adminPassword = process.env.ADMIN_PASSWORD;

function getConnectedClient() {
  var connectionString = process.env.DATABASE_URL;

  var client = new pg.Client(connectionString);

  client.connect();

  return client;
}

function isAdmin(password) {
  return password === adminPassword;
}

module.exports = {
  getConnectedClient: getConnectedClient,
  isAdmin: isAdmin
};
