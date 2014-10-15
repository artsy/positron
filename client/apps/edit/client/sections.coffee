_ = require 'underscore'
Backbone = require 'backbone'
sd = require('sharify').data
marked = require 'marked'
sectionListTemplate = require '../templates/section_list.jade'
textSectionTemplate = require '../templates/text_section.jade'

# Top-level view with a section tool & the various section components

module.exports = class SectionList extends Backbone.View

  initialize: (options) ->
    { @sections, @article } = options
    @render()
    @sections.on 'add remove', @renderSections
    @sections.on 'change add remove', _.debounce (=>
      @article.save sections: @sections.toJSON()
    ), 500
    new SectionTool el: @$('.edit-section-tool'), sections: @sections

  render: ->
    @$el.html sectionListTemplate sections: @sections.models
    @renderSections()

  renderSections: =>
    @$('.edit-section-list').html ''
    @sections.each (section) =>
      @$('.edit-section-list').append new TextSection(section: section).render()

# The section tool that adds new sections at the bottom of the list

class SectionTool extends Backbone.View

  initialize: (options) ->
    { @sections } = options

  events:
    'click .edit-section-tool-icon': 'toggle'
    'click .edit-section-tool-text': 'newTextSection'

  toggle: ->
    @$el.attr 'data-state-open', @$el.attr('data-state-open') is 'false'

  newTextSection: ->
    @sections.add { type: 'text', body: '.' }

# Text section that can toggle between editing & static mods

class TextSection extends Backbone.View

  className: 'edit-section-text-container'

  initialize: (options) ->
    { @section } = options

  render: ->
    @$el.html textSectionTemplate section: @section

  events:
    'click .edit-section-text-editing-bg': 'toggleEditMode'
    'click .edit-section-text-editing-bg': 'update'
    'click .edit-section-text': 'toggleEditMode'
    'keyup .edit-section-text-editing textarea': 'handleEditKeyup'

  toggleEditMode: ->
    @$el.attr 'data-state-editing', @$el.attr('data-state-editing') is 'false'

  update: ->
    @section.collection.trigger 'add'

  handleEditKeyup: (e) ->
    @section.set body: e.target.value