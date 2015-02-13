require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
{ TECH_SUPPORT, MANDRILL_APIKEY } = process.env
mandrill = require('node-mandrill')(MANDRILL_APIKEY)
express = require 'express'

to = for email in TECH_SUPPORT.split ','
  { email: email, name: 'Writer User' }
app = module.exports = express()

app.get '/report', (req, res, next) ->
  mandrill '/messages/send',
    message:
      to: to
      from_email: 'writer@artsymail.com'
      subject: 'Artsy Writer Bug Report'
      text: req.query.text
      html: req.query.html
  , (err, mandrillRes) ->
    return next err if err
    res.send mandrillRes
