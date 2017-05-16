# Script that sends GA data to Airtable
#
# There are buckets of 5 row updates each that pull data from GA and
# saves that data in Airtable. If the article doesn't exist yet, we create
# a new row.

Airtable = require 'airtable'
Sheet = require 'google-spreadsheet'
path = require 'path'
async = require 'async'
request = require 'superagent'
debug = require('debug')('airtable')
_ = require 'underscore'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Setup APIs
console.log 'Airtable <> GS start time: ' + new Date().toISOString()
console.log 'Authenticating with Google Sheets and Airtable...'
batch = 1
base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
doc = new Sheet process.env.GOOGLE_SHEET_ID

if process.env.NODE_ENV is 'development'
  creds = require '../../sheetsjwt.json'
else
  creds =
    client_email: process.env.GOOGLE_SHEET_EMAIL
    private_key: process.env.GOOGLE_SHEET_KEY

fetches = []

# Authenticate with Google Sheets
fetches.push (cb) ->
  doc.useServiceAccountAuth creds, (err, res) ->
    console.log 'Completed Authentication.'
    cb()

# Get some sheet info
fetches.push (cb) ->
  doc.getInfo (err, info) ->
    @totalRows = info.worksheets[1].rowCount
    console.log 'Total Rows: ' + @totalRows
    cb()

# Create buckets of the data copy task
fetches.push (cb) ->
  dataCopyTasks = []
  console.log Math.ceil(@totalRows/5)
  _(Math.ceil(@totalRows/5)).times (i) ->
    offset = i * 5
    dataCopyTasks.push (clb) ->
      # Get 5 GA rows
      doc.getRows 2, # worksheet_id is the index of the sheet starting from 1
        limit: 5
        offset: offset
      , (err, rows) ->
        # Copy data to Airtable
        airtableFetches = getAirtableFetches(rows)
        async.parallel airtableFetches, (err, res) ->
          return debug err if err
          clb()

  console.log 'Starting fetches...'
  console.log 'Created ' + dataCopyTasks.length + ' buckets'
  async.series dataCopyTasks, (err, res) ->
    console.log 'Completed all buckets'
    cb()

# Make fetches happen
async.series fetches, (err, res) ->
  console.log 'Airtable <> GS end time: ' + new Date().toISOString()

# Create or update Airtable row
getAirtableFetches = (rows) ->
  _.map rows, (row) ->
    (airtableCb) ->
      landingPage = row.galandingpagepath
      return airtableCb() unless landingPage
      base('Archive').select
        filterByFormula: "({Name} = 'https://#{landingPage}')"
        view: 'Archive List'
      .firstPage (err, records) ->
        if err
          debug err
          return airtableCb()
        # Airtable's API doesn't let you create rows with UPDATE, so separate the calls
        if records.length is 0
          base('Archive').create rowValues(row, true), (err, record) ->
            if err
              debug err if err
              return airtableCb()
            airtableCb()
        else
          return airtableCb() unless records[0]?.getId()
          record = records[0].getId()
          base('Archive').update record, rowValues(row, false), (err, record) ->
            if err
              debug err if err
              return airtableCb()
            airtableCb()

# Normalize data given a GS row
rowValues = (row) ->
  gausers: parseInt row.gausers
  gasessions: parseInt row.gasessions
  gaavgSessionDuration: parseFloat row.gaavgsessionduration
  gapageviewsPerSession: parseFloat row.gapageviewspersession
  'Name': 'https://' + row.galandingpagepath