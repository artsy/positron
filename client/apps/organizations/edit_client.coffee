AdminEditView = require '../../components/admin_form/index.coffee'
Organization = require '../../models/organization.coffee'
sd = require('sharify').data
AutocompleteList = require '../../components/autocomplete_list/index.coffee'

@init = ->
  new AdminEditView
    model: new Organization(sd.ORGANIZATION)
    el: $('body')
    onDeleteUrl: '/organizations'
  new AutocompleteList $('.organization-authors')[0],
    url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
    filter: (users) -> for user in users
      { id: user.id, value: _.compact([user.name, user.email]).join(', ') }
    placeholder: 'Add a user by name or email....'