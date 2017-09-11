/* eslint-disable no-console */

const env = require('node-env-file')
env('.env')

require('coffee-script/register')

const fs = require('fs')
const path = require('path')
const { schema } = require('../api/apps/graphql')
const { graphql } = require('graphql')
const { introspectionQuery, printSchema } = require('graphql/utilities')

const destination = process.argv[2]
if (destination === undefined || !fs.existsSync(destination)) {
  console.error('Usage: dump-schema.js /path/to/output/directory')
  process.exit(1)
}

// Save JSON of full schema introspection for Babel Relay Plugin to use
graphql(schema, introspectionQuery).then(
  result => {
    fs.writeFileSync(path.join(destination, 'schema.json'), JSON.stringify(result, null, 2))
  },
  error => {
    console.error('ERROR introspecting schema: ', JSON.stringify(error, null, 2))
  }
)

// Save user readable type system shorthand of schema
fs.writeFileSync(path.join(destination, 'schema.graphql'), printSchema(schema))
