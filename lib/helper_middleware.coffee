module.exports = (req, res, next) ->
  res.backboneError = (model, response) -> next response
  next()