#
# Auth setup code using passport and friends.
# TODO: Extract into an artsy-oauth-passport module
#

sd = require('sharify').data
Backbone = require 'backbone'
passport = require 'passport'
OAuth2Strategy = require 'passport-oauth2'
CurrentUser = require '../../models/current_user'

setupPassport = ->
  passport.use 'artsy', new OAuth2Strategy
    authorizationURL: process.env.ARTSY_URL + '/oauth2/authorize'
    tokenURL: process.env.ARTSY_URL + '/oauth2/access_token'
    clientID: process.env.ARTSY_ID
    clientSecret: process.env.ARTSY_SECRET
    callbackURL: process.env.APP_URL + '/auth/artsy/callback'
  , (accessToken, refreshToken, profile, done) ->
    done null, accessToken
  passport.serializeUser (userOrAccessToken, done) ->
    if userOrAccessToken.id?
      done null, JSON.stringify userOrAccessToken.toJSON()
    else
      new CurrentUser().fetch
        headers: 'X-Access-Token': userOrAccessToken
        error: (m, res) -> done res.body
        success: (user) -> done null, JSON.stringify user.toJSON()
  passport.deserializeUser (user, done) ->
    try
      done null, new CurrentUser JSON.parse user
    catch e
      return done e

requireLogin = (req, res, next) ->
  if req.user? then next() else res.redirect '/login'

logout = (req, res) ->
  req.logout()
  res.redirect sd.APP_URL

module.exports = (app) ->
  setupPassport()
  app.use passport.initialize()
  app.use passport.session()
  app.get '/login', passport.authenticate('artsy')
  app.get '/auth/artsy/callback', passport.authenticate 'artsy',
    successRedirect: '/'
    failureRedirect: '/logout'
  app.get '/logout', logout
  app.use requireLogin
