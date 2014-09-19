#
# A small isomorphic wrapper around Traverson that DRYs up HAL-style
# fetching code & model creation for Spooky.
#
# Use like:
# spooky = require '../lib/spooky_fetcher'
# spooky.new Sections, 'articles[0].sections', (err, sections) ->
#

_ = require 'underscore'
sd = require('sharify').data

@new = (model, labels, templateParams, callback) ->

  spooky = require('traverson').jsonHal.from(sd.SPOOKY_URL)

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
  req = spooky.newRequest()
    .follow(follows)
    .withRequestOptions(qs: 'token': sd.SPOOKY_TOKEN)

  # Optionally exclude templateParams and let the last arg be the callback
  if _.isFunction templateParams
    callback = templateParams
  else
    req.withTemplateParameters(templateParams)

  # Crawl the links and end the request
  req.getResource (err, resource) ->
    return callback? err if err
    data = if _.isArray resource
             (_.omit(obj, '_links', '_embedded') for obj in resource)
           else
              _.omit data, '_links', '_embedded'
    model = new model data
    if _.isFunction(templateParams)
      callback? null, model
    else
      callback? null, model