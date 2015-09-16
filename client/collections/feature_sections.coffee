_ = require 'underscore'
Backbone = require 'backbone'
moment = require 'moment'
FeatureSection = require '../models/feature_section.coffee'
sd = require('sharify').data
{ ApiCollection } = require './mixins.coffee'

module.exports = class FeatureSections extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/sections"

  model: FeatureSection

  toPaginatedListItems: ->
    @map (featureSection) ->
      imgSrc: featureSection.get('thumbnail_url')
      title: featureSection.get('title')
      subtitle: (
        moment(featureSection.get('start_at')).format('MMM Do') + ' – ' +
        moment(featureSection.get('end_at')).format('MMM Do')
      )
      href: "/sections/#{featureSection.get('id')}/edit"