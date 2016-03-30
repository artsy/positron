_ = require 'underscore'
Backbone = require 'backbone'
{ Image } = require 'artsy-backbone-mixins'
{ SECURE_IMAGES_URL } = require('sharify').data

module.exports = class AdditionalImage extends Backbone.Model

  _.extend @prototype, Image(SECURE_IMAGES_URL)
