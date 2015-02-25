Users = require '../../collections/users.coffee'

@index = (req, res) ->
  page = parseInt(req.query.page) or 1
  size = 10
  new Users().fetch
    data:
      limit: size
      offset: if page then (page - 1) * size else 0
    headers: 'X-Access-Token': req.user.get 'access_token'
    success: (users) ->
      res.locals.sd.USERS = users.toJSON()
      res.render 'index',
        users: users.models
        page: page
        totalPages: Math.ceil(users.count / size)