require('node-env-file')(require('path').resolve __dirname, '../.env')
{ MongoClient } = require 'mongodb'
path = require 'path'
{ indexForSearch } = require '../src/api/apps/articles/model/distribute'
Article = require '../src/api/apps/articles/model/index.js'
search = require '../src/api/lib/search_client'
asyncLib = require 'async'

env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Check for dry-run flag
isDryRun = process.argv.includes('--dry-run')

console.log('=' .repeat(80))
console.log('REINDEXING VIDEO ARTICLES')
if isDryRun
  console.log('🔍 DRY RUN MODE - No changes will be made')
console.log('=' .repeat(80))
console.log('Environment:', process.env.NODE_ENV || 'development')
console.log('MongoDB URL:', process.env.MONGOHQ_URL ? 'Configured' : 'NOT CONFIGURED')
console.log('Search Configuration:')
console.log('  - URL:', process.env.SEARCH_URL || 'NOT CONFIGURED')
console.log('  - Index Name:', search.index)
console.log('  - Index Suffix:', process.env.SEARCH_INDEX_SUFFIX || 'production')
if isDryRun
  console.log('Mode: DRY RUN (use without --dry-run flag to perform actual reindexing)')
console.log('=' .repeat(80))
console.log()

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
      console.log('Fetching video articles (published: true, layout: video)...')

      # Find only published video articles
      articlesCollection.find({
        layout: 'video'
        published: true
      }).sort({ published_at: -1 }).toArray()
    .then (articles) ->
      console.log('✓ Found ' + articles.length + ' video articles to reindex')
      console.log()

      if articles.length is 0
        console.log('No video articles found. Exiting.')
        return client.close().then -> process.exit(0)

      # Show sample of articles to be reindexed
      console.log('Articles to be reindexed:')
      for article in articles
        hasMedia = article.media?.url?
        status = if hasMedia then '✓' else '✗ NO MEDIA URL'
        console.log("  #{status} #{article.title} (#{article._id})")
      console.log()

      if isDryRun
        console.log('🔍 DRY RUN MODE: Skipping actual indexing')
        console.log('✅ Connection successful!')
        console.log('✅ Found ' + articles.length + ' video articles that would be reindexed')
        console.log()
        console.log('To perform actual reindexing, run without the --dry-run flag')
        return client.close().then -> process.exit(0)

      console.log('Starting indexing process...')
      console.log()

      new Promise (resolve, reject) ->
        processedCount = 0
        errorCount = 0
        successCount = 0

        asyncLib.mapSeries articles, (article, cb) ->
          processedCount++
          console.log("=" .repeat(80))
          console.log("[#{processedCount}/#{articles.length}] Processing: #{article.title}")
          console.log("  Article ID: #{article._id}")
          console.log("  Layout: #{article.layout}")
          console.log("  Published: #{article.published}")
          console.log("  Has media.url: #{!!article.media?.url}")

          indexWorker article, (err) ->
            if err
              errorCount++
              console.error("  ✗ ERROR indexing article: #{err.message}")
            else
              successCount++
              console.log("  ✓ Successfully indexed")
            console.log()
            cb(null) # Continue even if there's an error
        , (err, results) ->
          resolve({ results, errorCount, successCount, processedCount })
    .then ({ results, errorCount, successCount, processedCount }) ->
      endTime = Date.now()
      duration = Math.round((endTime - startTime) / 1000)

      console.log('=' .repeat(80))
      console.log('REINDEXING COMPLETE')
      console.log('=' .repeat(80))
      console.log('📊 Summary:')
      console.log("  - Total processed: #{processedCount}")
      console.log("  - Successfully indexed: #{successCount}")
      console.log("  - Errors: #{errorCount}")
      console.log("  - Duration: #{duration} seconds")
      console.log('=' .repeat(80))
      console.log()
      console.log('Closing database connection...')

      client.close()
        .then ->
          console.log('✓ Database connection closed successfully')
          console.log()
          console.log('✅ Script completed!')
          if errorCount > 0
            console.log('⚠️  Some errors occurred. Check logs above.')
            process.exit(1)
          else
            process.exit(0)
        .catch (err) ->
          console.error('✗ Error closing database connection:', err)
          process.exit(1)
    .catch (err) ->
      console.error('=' .repeat(80))
      console.error('✗ FATAL ERROR')
      console.error('=' .repeat(80))
      console.error('Error:', err.message)
      console.error('Stack:', err.stack)
      console.error('=' .repeat(80))

      client.close()
        .then -> process.exit(1)
        .catch -> process.exit(1)

indexWorker = (article, cb) ->
  try
    articlePresent = Article.present(article)

    indexForSearch articlePresent, (err) ->
      if err
        cb(err)
      else
        cb()
  catch err
    cb(err)

console.log('Initializing video article reindexing...')
if isDryRun
  console.log('Running in DRY RUN mode - no changes will be made')
console.log()
main()
