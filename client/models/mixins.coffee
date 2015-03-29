#
# Mixin common methods
#

_ = require 'underscore'

@User =

  iconUrl: ->
    url = @get('icon_urls')?.square140?.replace('jpg', 'png')
    url ?= _.values(@get 'icon_urls')[0]
    url ?= '/images/layout_missing_user.png'
    url

  isAdmin: ->
    @get('details').type is 'Admin'

  profileHandle: ->
    @get('profile')?.handle
