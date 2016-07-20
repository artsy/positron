#
# Auth setup code using passport and friends.
# TODO: Extract into an artsy-oauth-passport module
#

sd = require('sharify').data
Backbone = require 'backbone'
passport = require 'passport'
OAuth2Strategy = require 'passport-oauth2'
User = require '../../models/user'
Channel = require '../../models/channel'

setupPassport = ->
  passport.use 'artsy', new OAuth2Strategy
    authorizationURL: process.env.ARTSY_URL + '/oauth2/authorize'
    tokenURL: process.env.ARTSY_URL + '/oauth2/access_token'
    clientID: process.env.ARTSY_ID
    clientSecret: process.env.ARTSY_SECRET
    callbackURL: process.env.APP_URL + '/auth/artsy/callback'
  , (accessToken, refreshToken, profile, done) ->
    new User(access_token: accessToken).fetch
      headers: 'X-Access-Token': accessToken
      error: (m, err) -> done err
      success: (user) ->
        id = user.get('channel_ids')?.concat(user.get('partner_ids'))[0]
        id = process.env.DEFAULT_PARTNER_ID if not id and user.get('type') is 'Admin'
        new Channel(id: id).fetchChannelOrPartner
          headers: 'X-Access-Token': accessToken
          error: (m, err) -> done err
          success: (channel) =>
            user.set 'current_channel', channel.denormalized()
            done null, user
  passport.serializeUser (user, done) ->
    done null, user.toJSON()
  passport.deserializeUser (user, done) ->
    done null, new User(user)

logoutOldSchema = (req, res, next) ->
  if req.user and not req.user.get('type')
    res.redirect '/logout'
  else
    next()

requireLogin = (req, res, next) ->
  if req.user? then next() else res.redirect '/login'

requireChannel = (req, res, next) ->
  if req.user?.get('current_channel') then next() else res.redirect '/logout'

logout = (req, res) ->
  req.logout()
  res.redirect sd.ARTSY_URL + '/users/sign_out'

unauthorized = (req, res) ->
  res.render '../../components/error/page', error: status: 403

module.exports = (app) ->
  setupPassport()
  app.use passport.initialize()
  app.use passport.session()
  app.get '/login', passport.authenticate('artsy')
  app.get '/auth/artsy/callback', passport.authenticate 'artsy',
    successRedirect: '/'
    failureRedirect: '/unauthorized'
  app.get '/logout', logout
  app.get '/unauthorized', unauthorized
  app.use logoutOldSchema
  app.use requireLogin
  app.use requireChannel
