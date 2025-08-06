elasticsearch = require('elasticsearch')
{ ELASTICSEARCH_URL, OPENSEARCH_URL, ELASTICSEARCH_INDEX_SUFFIX, USE_OPENSEARCH } = process.env

client = new elasticsearch.Client
          host: if USE_OPENSEARCH == 'true' then OPENSEARCH_URL else ELASTICSEARCH_URL
          maxRetries: 2
          keepAlive: true
          maxSockets: 10

module.exports =
  index: 'articles_' + (ELASTICSEARCH_INDEX_SUFFIX or 'production')
  client: client
  isOpenSearch: USE_OPENSEARCH == 'true'
