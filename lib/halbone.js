//
// A small isomorphic wrapper around Traverson that DRYs up HAL-style
// fetching code & model creation for Backbone. Simplifies Traverson API, and
// injects the model with the crawled url for `save`, `destroy` etc. to work as
// expected.
//
// Use like:
//
// var api = require('../lib/halbone')("http://api.com");
// api.intercept(function(req) {
//   req.withRequestOptions(qs: 'token': sd.SPOOKY_TOKEN);
// });
// api.get(Sections, 'articles[0].sections', function(err, sections) {
//   sections.fetch...
//   sections.save...
// });
//

var _ = require('underscore'),
    traverson = require('traverson');

module.exports = function(API_URL) {

  var api = traverson.jsonHal.from(API_URL),
      interceptCallback;

  // Create a new halbone API
  return {

    intercept: function(callback) {
      return interceptCallback = callback;
    },

    get: function(Model, labels, options, callback) {

      // Build the Traverson follow query
      var follows = [];
      _.each(labels.split('.'), function(label) {
        // Is accessing an array so split the label into something more
        // Traverson appropriate.
        if (label.match(/]$/)) {
          follows.push(label.split('[')[0]);
          follows.push(label);
        } else {
          follows.push(label);
        }
      });

      // Build the request
      var req = api.newRequest().follow(follows);
      if (interceptCallback) interceptCallback(req);

      // Optionally exclude options and let the last arg be the callback
      if (_.isFunction(options)) {
        callback = options;

      // Otherwise allow extra request build up through options
      } else {
        if (options.params) req.withTemplateParameters(options.params);
        if (options.headers) req.withRequestOptions({ headers: options.headers });
        if (options.qs) req.withRequestOptions({ qs: options.qs });
      }

      // Crawl the links and end the request
      req.getResource(function(err, resource) {
        if (err && callback) return callback(err);

        // Set up the model and inject the url for save/destroy/fetch to work
        var model = new Model(resource);
        if (_.isArray(resource)) {
          // TODO: See if there's some kind of convention for getting the root
          // link out of embedded resources
        } else {
          model.url = resource._links.self.href;
        }
        if (callback) callback(null, model);
      });
    }
  };
};