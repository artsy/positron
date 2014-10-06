#
# Auth setup code using passport and friends.
#

sd = require('sharify').data
Backbone = require 'backbone'
passport = require 'passport'
OAuth2Strategy = require 'passport-oauth2'
CurrentUser = require '../../models/current_user'

passport.use 'artsy', new OAuth2Strategy
  authorizationURL: process.env.ARTSY_URL + '/oauth2/authorize'
  tokenURL: process.env.ARTSY_URL + '/oauth2/access_token'
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
    error: (m, e) -> done e
    success: (user) -> done null, user

module.exports = (app) ->
  app.use passport.initialize()
  app.use passport.session()
  app.get '/login', passport.authenticate('artsy')
  app.get '/auth/artsy/callback', passport.authenticate 'artsy',
    successRedirect: '/'
    failureRedirect: '/login'
  app.get '/logout', (req, res) ->
    res.redirect sd.ARTSY_URL
  app.use (req, res, next) ->
    if req.user? then next() else res.redirect '/login'