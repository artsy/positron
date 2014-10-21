#
# A stand-in for this module: https://github.com/guardian/scribe-plugin-sanitizer
# for the time being. Currently there's some quirkyness with the whole AMD/npm
# dependency setup.
#
HTMLJanitor = require 'html-janitor'

module.exports = (config) ->

  # We extend the config to let through Scribe position markers,
  # otherwise we lose the caret position when running the Scribe
  # content through this sanitizer.
  config.tags.em ?= {}
  config.tags.em.class = 'scribe-marker'
  (scribe) ->
    janitor = new HTMLJanitor(config)
    scribe.registerHTMLFormatter "sanitize", janitor.clean.bind(janitor)