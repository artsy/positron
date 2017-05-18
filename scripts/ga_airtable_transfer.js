const Airtable = require('airtable')
const Sheet = require('google-spreadsheet')
const path = require('path')
const env = require('node-env-file')

switch (process.env.NODE_ENV) {
  case 'test':
    env(path.resolve(__dirname, '../.env.test'))
    break
  case 'production':
  case 'staging':
    break
  default:
    env(path.resolve(__dirname, '../.env'))
}

console.log('Airtable <> GS start time: ' + new Date().toISOString())
console.log('Authenticating with Google Sheets and Airtable...')

let rowCount, creds

const base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY
}).base(process.env.AIRTABLE_BASE)

const doc = new Sheet(process.env.GOOGLE_SHEET_ID)

if (process.env.NODE_ENV === 'development') {
  creds = require('../../sheetsjwt.json')
} else {
  creds = {
    client_email: process.env.GOOGLE_SHEET_EMAIL,
    private_key: process.env.GOOGLE_SHEET_KEY
  }
}

function authenticateGoogle () {
  return new Promise((resolve, reject) => {
    doc.useServiceAccountAuth(creds, (err, res) => {
      err ? reject(err) : resolve(res)
    })
  })
}

function docInfo () {
  return new Promise((resolve, reject) => {
    doc.getInfo((err, res) => {
      err ? reject(err) : resolve(res.worksheets[1].rowCount)
    })
  })
}

async function copyDataTask (offset) {
  try {
    const getRows = () =>
      new Promise((resolve, reject) => {
        doc.getRows(2, { limit: 5, offset: offset }, (err, rows) => {
          err ? reject(err) : resolve(rows)
        })
      })
    const rows = await getRows()
    let promises = rows.map((row) => airtableFetch(row))
    await Promise.all(promises)
  } catch (err) {
    console.log(err)
  }
}

async function airtableFetch (row) {
  try {
    const getRecord = () =>
      new Promise((resolve, reject) => {
        base('Archive').select({
          filterByFormula: "({Name} = 'https://" + landingPage + "')",
          view: 'Archive List'
        }).firstPage((err, recs) => {
          err ? reject(err) : resolve(recs)
        })
      })

    const updateRecord = (recordId, row) =>
      new Promise((resolve, reject) => {
        base('Archive').update(recordId, rowValues(row, false), (err, record) => {
          err ? reject(err) : resolve(record)
        })
      })

    const createRecord = (row) =>
      new Promise((resolve, reject) => {
        base('Archive').create(rowValues(row, true), (err, record) => {
          err ? reject(err) : resolve(record)
        })
      })

    const landingPage = row.galandingpagepath
    if (!landingPage) {
      return
    }
    const records = await getRecord()

    // Create or Update Airtable record
    if (!records.length) {
      const create = await createRecord(row)
      return create
    } else {
      if (!(records && records[0].getId())) {
        return
      }
      var recordId = records[0].getId()
      const update = await updateRecord(recordId, row)
      return update
    }
  } catch (err) {
    console.log(err)
  }
}
function rowValues (row) {
  return {
    gausers: parseInt(row.gausers),
    gasessions: parseInt(row.gasessions),
    gaavgSessionDuration: parseFloat(row.gaavgsessionduration),
    gapageviewsPerSession: parseFloat(row.gapageviewspersession),
    'Name': 'https://' + row.galandingpagepath
  }
}

(async function () {
  try {
    // Google Auth
    await authenticateGoogle()
    console.log('Completed Authentication')

    // Google Sheet Info
    rowCount = await docInfo()
    console.log('Total Rows: ' + rowCount)
    var rowBuckets = Math.ceil(rowCount / 5)

    // Copy Data Tasks
    for (var i = 0; i <= rowBuckets; i++) {
      let offset = i * 5
      await copyDataTask(offset)
    }

    console.log('Completed All Buckets')
    console.log('Airtable <> GS end time: ' + new Date().toISOString())
  } catch (err) {
    console.log(err)
  }
}())
