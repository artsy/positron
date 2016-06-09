AutocompleteList = require '../../../components/autocomplete_list/index.coffee'
Channel = require '../../../models/channel.coffee'
sd = require('sharify').data
async = require 'async'
request = require 'superagent'

@init = ->
  @channel = new Channel sd.CHANNEL
  @user_ids = @channel.get 'user_ids' or []
  list = new AutocompleteList $('#channel-edit__users')[0],
    name: 'user_ids[]'
    url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
    placeholder: 'Search by user name or email...'
    filter: (users) -> for user in users
      { id: user.id, value: _.compact([user.name, user.email]).join(', ')}
    selected: (e, item, items) =>
      @channel.save user_ids: _.pluck items, 'id'
    removed: (e, item, items) =>
      @channel.save user_ids: _.without(_.pluck(items, 'id'),item.id)
  if @user_ids.length > 0
    @users = []
    async.each @user_ids, (id, cb) =>
      request
        .get("#{sd.ARTSY_URL}/api/v1/user/#{id}")
        .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
          @users.push(
            {
              id: res.body.id,
              value: _.compact([res.body.name, res.body.email]).join(', ')
            })
          cb()
    , =>
      list.setState loading: false, items: @users
  else
    list.setState loading: false
