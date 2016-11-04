elasticsearch = require('elasticsearch')
{ NODE_ENV, ELASTICSEARCH_URL } = process.env

client = new elasticsearch.Client
          host: ELASTICSEARCH_URL
          maxRetries: 2
          keepAlive: true
          maxSockets: 10

module.exports =
  index: 'articles_' + NODE_ENV
  client: client
