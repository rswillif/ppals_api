var pg = require('pg');
var dotenv = require('dotenv');

try {
  dotenv.config();
} catch (err) {
}

var connectionString = process.env.DATABASE_URL;

var client = new pg.Client(connectionString);

client.connect();

var queryOne = client.query('CREATE TABLE teams(id SERIAL PRIMARY KEY, image BYTEA, title TEXT not null, body TEXT not null)');
var queryTwo = client.query('CREATE TABLE posts(id SERIAL PRIMARY KEY, date TIMESTAMP, title TEXT not null, body TEXT not null)');
var queryThree = client.query('CREATE TABLE schools(id SERIAL PRIMARY KEY, date TIMESTAMP, name TEXT not null, city TEXT not null, state TEXT not null, county TEXT not null)');
var queryFour = client.query('CREATE TABLE admins(id SERIAL PRIMARY KEY, tokens TEXT)');

queryOne.on('end', tryEndClient);
queryTwo.on('end', tryEndClient);
queryThree.on('end', tryEndClient);
queryFour.on('end', tryEndClient);

var queryCount = 0;

function tryEndClient() {
  queryCount++;

  if (queryCount == 4) {
    client.end();
  }
}
