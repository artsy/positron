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

console.log 'Start time: ' + new Date().toISOString()
batch = 1
base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
base('Production').select({
  maxRecords: 1000
  view: 'Master'
}).eachPage (records, fetchNextPage) ->
  parselyCalls = []
  records.forEach (record) ->
    parselyCalls.push(
      (cb) ->
        return cb(null, {}) unless record.get('Article Link')
        request.get("https://api.parsely.com/v2/analytics/post/detail?apikey=#{process.env.PARSELY_KEY}&secret=#{process.env.PARSELY_SECRET}&days=90&url=#{record.get('Article Link')}")
          .end (err, res) ->
            data = { record: record.id, hits: res?.body?.data[0]?._hits, visitors: res?.body?.data[0]?.visitors }
            cb null, data
    )
  async.parallel parselyCalls, (err, res) ->
    updateCalls = []
    console.log 'Finished Parsely fetches batch: ' + batch
    res.forEach (record) ->
      updateCalls.push(
        (cb) ->
          return cb(null, {}) unless record?.record
          base('Production').update record?.record,
            'Visitors': record?.visitors
            'Hits': record?.hits
          , (err, record) ->
            cb null, record
      )
    async.parallel updateCalls, (err, res) ->
      console.log err if err
      console.log 'Finished Airtable updates batch: ' + batch
      batch = batch + 1
      fetchNextPage()
, (err) ->
  console.log err if err
  console.log 'Finish time: ' + new Date().toISOString()