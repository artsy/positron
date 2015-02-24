Users = require '../../collections/users.coffee'

@index = (req, res) ->
  new Users().fetch
    data: q: 'Craig'
    headers: 'X-Access-Token': req.user.get 'access_token'
    success: (users) ->
      res.render 'template', users: users.models