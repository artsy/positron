var Airtable = require('airtable');
var Sheet = require('google-spreadsheet');
var path = require('path');
var asyncLib = require('async');
var request = require('superagent');
var debug = require('debug')('airtable');
var _ = require('underscore');
var env = require('node-env-file');

switch (process.env.NODE_ENV) {
  case 'test':
    env(path.resolve(__dirname, '../.env.test'));
    break;
  case 'production':
  case 'staging':
    '';
    break;
  default:
    env(path.resolve(__dirname, '../.env'));
}

console.log('Airtable <> GS start time: ' + new Date().toISOString());
console.log('Authenticating with Google Sheets and Airtable...');

var batch = 1;
var rowCount;

var base = new Airtable({
  apiKey: process.env.AIRTABLE_KEY
}).base(process.env.AIRTABLE_BASE);

var doc = new Sheet(process.env.GOOGLE_SHEET_ID);

if (process.env.NODE_ENV === 'development') {
  var creds = require('../../sheetsjwt.json');
} else {
  var creds = {
    client_email: process.env.GOOGLE_SHEET_EMAIL,
    private_key: process.env.GOOGLE_SHEET_KEY
  };
}

function authenticateGoogle() {
  return new Promise( function(resolve, reject) {
    doc.useServiceAccountAuth(creds, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })
  })
}

function docInfo() {
  return new Promise( function(resolve, reject) {
    doc.getInfo(function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.worksheets[1].rowCount)
      }
    })
  })
}

function copyDataTask (offset) {
  return new Promise( function (resolve, reject) {
    // Fetch 5 rows in Google Sheet
    doc.getRows(2, { limit: 5, offset: offset }, async function (err, rows) {
      if (err) {
        reject()
      }
      // Copy Data Tasks
      let promises = rows.map((row) => airtableFetch(row));
      let results = await Promise.all(promises)
      console.log(results);
      resolve()
    })
  })
}

function airtableFetch (row) {
  new Promise( function (resolve, reject) {
    var landingPage = row.galandingpagepath;
    if (!landingPage){
      console.log('cannot find a landing page path');
      reject();
    }
    base('Archive').select({
      filterByFormula: "({Name} = 'https://" + landingPage + "')",
      view: 'Archive List'
    }).firstPage(function(err, records) {
      if (err) {
        console.log('rejecting...')
        reject(err)
      }
      if (records.length === 0) {
        base('Archive').create(rowValues(row, true), function(err, rec) {
          if (err) {
            console.log('rejecting....')
            reject(err)
          }
          console.log('Creating row...')
          resolve(rec);
        });
      } else {
        if (!(records[0] && records[0].getId())) {
          console.log('cannot find a record')
          reject();
        }
        var recordId = records[0].getId();
        console.log(recordId)
        base('Archive').update(recordId, rowValues(row, false), function(err, rec) {
          if (err) {
            reject(err);
          }
          console.log('Updating row...')
          resolve(rec);
        });
      }
    });
  });
}

function rowValues (row) {
  return {
    gausers: parseInt(row.gausers),
    gasessions: parseInt(row.gasessions),
    gaavgSessionDuration: parseFloat(row.gaavgsessionduration),
    gapageviewsPerSession: parseFloat(row.gapageviewspersession),
    'Name': 'https://' + row.galandingpagepath
  };
};

(async function () {
  try {
    // Google Auth
    var authResult = await authenticateGoogle();
    console.log('Completed Authentication');

    // Google Sheet Info
    rowCount = await docInfo();
    var rowBuckets = Math.ceil(rowCount / 5)
    console.log('Total Rows: ' + rowCount);

    // Copy Data Tasks
    for (var i=0; i<=rowBuckets; i++) {
      console.log('another iteration started')
      let offset = i * 5;
      var task = await copyDataTask(offset);
    }

    // Completed
    console.log('Completed All Buckets')
    console.log('Airtable <> GS end time: ' + new Date().toISOString());

  } catch (err) {
    console.log(err);
  }
}());