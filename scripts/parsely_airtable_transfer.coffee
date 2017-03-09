# Script that sends Parsely data to Airtable
Airtable = require 'airtable'
path = require 'path'
# Q = require 'bluebird-q'
# request = Q.promisify require 'superagent'
async = require 'async'
request = require 'superagent'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
base('Production').select({
  maxRecords: 20
  view: 'Master'
}).eachPage (records, fetchNextPage) ->
  parselyCalls = []
  records.forEach (record) ->
    # console.log 'Retrieved ' + record.get('Article Link')
    parselyCalls.push(
      (cb) ->
        request.get("https://api.parsely.com/v2/analytics/post/detail?apikey=#{process.env.PARSELY_KEY}&secret=#{process.env.PARSELY_SECRET}&days=90&url=#{record.get('Article Link')}")
          .end (err, res) ->
            obj = { record: record.id, hits: res.body.data[0]._hits }
            console.log obj
            cb null, { record: record.id, hits: res.body.data[0]._hits }
    )
  console.log parselyCalls
  async.parallel parselyCalls, (err, res) ->
    console.log res
    for record in res
      base('Production').update record?.record,
        'Visitors': record?.hits
      , (err, record) ->
        console.log err
        console.log record

    fetchNextPage()
, (err) ->
  console.log err if err