var appHelpers = require('../helpers/app-helpers');

function getAdminTokens(callback) {
  var client = appHelpers.getConnectedClient();

  var query = client.query('SELECT tokens FROM admins WHERE id=1', function (err, result) {
    if (!err && result.rowCount === 1) {
      callback(JSON.parse(result.rows[0].tokens));
    }
  });

  query.on('end', () => {
    client.end();
  });
}

function updateAdminTokens(tokens) {
  tokens = JSON.stringify(tokens);

  var client = appHelpers.getConnectedClient();

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

function sortUpdates(posts, events) {
  results = posts.concat(events);
  results = results.sort(function(a, b) {
    dateOne = new Date(a.date);
    dateTwo = new Date(b.date);
    return dateOne > dateTwo ? -1 : dateOne < dateTwo ? 1 : 0;
  });
  return results;
}

module.exports = {
  getAdminTokens: getAdminTokens,
  updateAdminTokens: updateAdminTokens,
  sortUpdates = sortUpdates
};
