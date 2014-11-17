#
# Auth setup code using passport and friends.
#

sd = require('sharify').data
Backbone = require 'backbone'
passport = require 'passport'
OAuth2Strategy = require 'passport-oauth2'
CurrentUser = require '../../models/current_user'

setupPassport = ->
  passport.use 'artsy', new OAuth2Strategy
    authorizationURL: process.env.GRAVITY_URL + '/oauth2/authorize'
    tokenURL: process.env.GRAVITY_URL + '/oauth2/access_token'
    clientID: process.env.ARTSY_ID
    clientSecret: process.env.ARTSY_SECRET
    callbackURL: process.env.APP_URL + '/auth/artsy/callback'
  , (accessToken, refreshToken, profile, done) ->
    passport.deserializeUser accessToken, done

  passport.serializeUser (user, done) ->
    done null, user.get('access_token')

  passport.deserializeUser (accessToken, done) ->
    new CurrentUser().fetch
      headers: 'X-Access-Token': accessToken
      error: (model, res) -> done res.error
      success: (user) -> done null, user

requireLogin = (req, res, next) ->
  if req.user? then next() else res.redirect '/login'

logout = (req, res) ->
  req.user.destroy()
  req.logout()
  res.redirect sd.GRAVITY_URL

module.exports = (app) ->
  setupPassport()
  app.use passport.initialize()
  app.use passport.session()
  app.get '/login', passport.authenticate('artsy')
  app.get '/auth/artsy/callback', passport.authenticate 'artsy',
    successRedirect: '/'
    failureRedirect: '/login'
  app.get '/logout', logout
  app.use requireLogin