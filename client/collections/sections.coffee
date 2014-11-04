_ = require 'underscore'
Backbone = require 'backbone'
Section = require '../models/section.coffee'

module.exports = class Sections extends Backbone.Collection

  model: Section