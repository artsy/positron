require('node-env-file')(require('path').resolve __dirname, '../.env')
{ MongoClient } = require 'mongodb'
path = require 'path'
{ indexForSearch } = Save = require '../src/api/apps/articles/model/distribute'
Article = require '../src/api/apps/articles/model/index.js'
ArticleModel = require '../src/api/models/article.coffee'
search = require '../src/api/lib/elasticsearch'
asyncLib = require 'async'
{ cloneDeep } = require 'lodash'

env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

console.log('Starting article reindexing process...')
console.log('Environment:', process.env.NODE_ENV || 'development')
console.log('MongoDB URL:', process.env.MONGOHQ_URL ? 'Configured' : 'NOT CONFIGURED')

# Log Elasticsearch configuration
console.log('Elasticsearch Configuration:')
console.log('  - URL:', process.env.SEARCH_URL || process.env.SEARCH_URL || 'NOT CONFIGURED')
console.log('  - Index Name:', search.index)
console.log('  - Index Suffix:', process.env.SEARCH_INDEX_SUFFIX || 'production')

main = ->
  startTime = Date.now()
  console.log('Connecting to MongoDB...')

  client = new MongoClient(process.env.MONGOHQ_URL)
  client.connect()
    .then (client) ->
      console.log('✓ Connected to MongoDB successfully')
      db = client.db()
      console.log('✓ Database connection established')
      return db.collection('articles')
    .then (articlesCollection) ->
      console.log('✓ Articles collection accessed')
      console.log('Fetching all articles from database (newest first)...')
      articlesCollection.find({}).sort({_id: -1}).toArray()
    .then (articles) ->
      console.log('✓ Found ' + articles.length + ' articles to index')
      console.log('Starting indexing process...')

      new Promise (resolve, reject) ->
        processedCount = 0
        errorCount = 0

        asyncLib.mapSeries articles, (article, cb) ->
          processedCount++
          console.log("[#{processedCount}/#{articles.length}] Indexing article: #{article._id} (#{article.title || 'No title'})")

          indexWorker article, (err) ->
            if err
              errorCount++
              console.error("✗ Error indexing article #{article._id}:", err)
            else
              console.log("✓ Successfully indexed article #{article._id}")
            cb(err)
        , (err, results) ->
          if err then reject(err) else resolve({results, errorCount, processedCount})
    .then ({results, errorCount, processedCount}) ->
      endTime = Date.now()
      duration = Math.round((endTime - startTime) / 1000)
      console.log('✓ Completed indexing ' + results.length + ' articles in ' + duration + ' seconds')
      console.log('📊 Summary:')
      console.log('  - Total processed: ' + processedCount)
      console.log('  - Successfully indexed: ' + (processedCount - errorCount))
      console.log('  - Errors: ' + errorCount)
      console.log('  - Duration: ' + duration + ' seconds')
      console.log('Closing database connection...')

      client.close()
        .then ->
          console.log('✓ Database connection closed successfully')
          console.log('Script completed successfully!')
          process.exit(0)
        .catch (err) ->
          console.error('✗ Error closing database connection:', err)
          console.log('Forcing script exit...')
          process.exit(0)
    .catch (err) ->
      console.error('✗ Fatal error during reindexing:', err)
      console.error('Stack trace:', err.stack)
      console.log('Closing database connection due to error...')
      client.close()
        .then ->
          console.log('✓ Database connection closed')
          process.exit(1)
        .catch ->
          console.log('Forcing script exit...')
          process.exit(1)

indexWorker = (article, cb) ->
  try
    console.log('  - Processing article:', article._id)
    articlePresent = Article.present(article)
    console.log('  - Article presented successfully')
    console.log('  - Indexing to Elasticsearch:')
    console.log('    * Document ID:', article.id?.toString() || article._id?.toString())
    console.log('    * Index Name:', search.index)

    indexForSearch articlePresent, (err) ->
      if err
        console.error('  - Error in indexForSearch:', err)
        cb(err)
      else
        console.log('  - ✓ Article indexed on Elasticsearch:', article.id or article._id)
        console.log('    * Index:', search.index)
        console.log('    * Document ID:', article.id?.toString() || article._id?.toString())
        cb()
  catch err
    console.error('  - Error in indexWorker:', err)
    cb(err)

console.log('Initializing reindexing script...')
main()
