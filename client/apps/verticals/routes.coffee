Verticals = require '../../collections/verticals'

@index = (req, res) ->
  new Verticals().fetch
    data: limit: 100
    error: res.backboneError
    success: (verticals) ->
      res.render 'index', verticals: verticals
