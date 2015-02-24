Autocomplete = require '../../components/autocomplete/index.coffee'

module.exports.init = ->
  new Autocomplete
    el: $('#contributors-add input')
    url: "#{sd.API_URL}/users?q=%QUERY"