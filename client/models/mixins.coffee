#
# Mixin common methods
#

_ = require 'underscore'

@User =

  iconUrl: ->
    _.values(@get('icon_urls'))[0]?.replace('jpg', 'png') or
    '/images/layout_missing_user.png'

  isAdmin: ->
    @get('details').type is 'Admin'

  profileHandle: ->
    @get('profile')?.handle
