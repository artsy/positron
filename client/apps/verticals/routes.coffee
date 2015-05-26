Verticals = require '../../collections/verticals'
Vertical = require '../../models/vertical'

@index = (req, res) ->
  new Verticals().fetch
    data: limit: 100
    error: res.backboneError
    success: (verticals) ->
      res.render 'index', verticals: verticals

@edit = (req, res) ->
  new Vertical(id: req.params.id).fetch
    error: res.backboneError
    success: (vertical) ->
      res.render 'edit', vertical: vertical

@save = (req, res) ->
  new Vertical(id: req.params.id).save
    data: req.body
    error: res.backboneError
    success: ->
      res.redirect '/verticals'