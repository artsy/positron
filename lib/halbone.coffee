#
# A small isomorphic wrapper around Traverson that DRYs up HAL-style
# fetching code & model creation for Backbone. Simplifies Traverson API, and 
# injects the model with the crawled url for `save`, `destroy` etc. to work as 
# expected.
#
# Use like:
# api = require('../lib/halbone')("http://api.com")
# api.intercept (req) -> req.withRequestOptions(qs: 'token': sd.SPOOKY_TOKEN)
# api.new Sections, 'articles[0].sections', (err, sections) ->
#   sections.fetch...
#   sections.save...
#

_ = require 'underscore'
traverson = require 'traverson'

module.exports = (API_URL) ->

  api = traverson.jsonHal.from(API_URL)
  interceptCallback = null

  methods =
    intercept: (callback) ->
      interceptCallback = callback
    new: (model, labels, options, callback) ->

      # Build the Traverson follow query
      follows = []
      for label in labels.split '.'
        # Is accessing an array so split the label into something
        # more Traverson appropriate.
        if label.match /]$/
          follows.push label.split('[')[0]
          follows.push label
        # Just a normal path
        else
          follows.push label

      # Build the request
      req = api.newRequest().follow(follows).withRequestOptions(jar: true)
      interceptCallback? req

      # Optionally exclude options and let the last arg be the callback
      if _.isFunction options
        callback = options

      # Otherwise allow extra request build up through options
      else
        req.withTemplateParameters(options.params) if options.params
        req.withRequestOptions(headers: options.headers) if options.headers
        req.withRequestOptions(qs: options.qs) if options.qs

      # Crawl the links and end the request
      req.getResource (err, resource) ->
        return callback? err if err

        # TODO: Set up the model's url for .save & .fetch to work
        model = new model resource

        callback? null, model