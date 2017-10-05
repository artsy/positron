require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
request = require 'superagent'
artsyXapp = require 'artsy-xapp'
async = require 'async'
fs = require 'fs'
ARTSY_URL = process.env.ARTSY_URL
API_URL = process.env.API_URL
ARTSY_ID = process.env.ARTSY_ID
ARTSY_SECRET = process.env.ARTSY_SECRET
# upload an array of artist names to search for in this directory
ARTISTLIST = require './artist_list.coffee'

artsyXapp.init { url: ARTSY_URL, id: ARTSY_ID, secret: ARTSY_SECRET }, ->
  async.mapSeries ARTISTLIST, (artist, cb) ->
    id = artist.toLowerCase().split(' ').join('-')
    request
      .get("#{ARTSY_URL}/api/v1/artist/#{id}")
      .set('X-XAPP-TOKEN': artsyXapp.token)
      .end (err, sres) =>
        console.error err if err
        name = sres.body.name
        fs.appendFile(__dirname + '/tmp/artist_names.txt', name + '\n', cb)
