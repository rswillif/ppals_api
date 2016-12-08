function sortUpdates(posts, events) {
  results = posts.concat(events);
  results = results.sort(function(a, b) {
    dateOne = new Date(a.date);
    dateTwo = new Date(b.date);
    return dateOne > dateTwo ? -1 : dateOne < dateTwo ? 1 : 0;
  });
}

module.exports = {
  sortUpdates = sortUpdates
}
