const Article = require('../src/api/apps/articles/model/index.js')

Article.backfill((err, results) => {
  console.log('All done')
  process.exit()
})
