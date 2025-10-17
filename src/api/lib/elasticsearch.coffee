elasticsearch = require('elasticsearch')
{ SEARCH_URL, SEARCH_INDEX_SUFFIX } = process.env

client = new elasticsearch.Client
          host: SEARCH_URL
          maxRetries: 2
          keepAlive: true
          maxSockets: 10

module.exports =
  index: 'articles_' + (SEARCH_INDEX_SUFFIX or 'production')
  client: client
