// Run like:
//
// mongo "mongodb+srv://<host>/app29923450" --username positron2 --password <redacted> scripts/db/<filename>

db.articles.createIndex(
  {
    primary_featured_artist_ids: 1,
    published: 1,
    published_at: -1,
  },
  { background: true }
)
