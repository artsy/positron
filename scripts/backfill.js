const Article = require('../src/api/apps/articles/model/index.js')

Article.backfill((err, results) => {
  if (err) {
    console.warn(err)
  }
  console.log('All done')
  process.exit()
})
