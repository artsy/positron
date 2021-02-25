// Run like:
//
// mongo "mongodb+srv://<host>/app29923450" --username positron2 --password <redacted> scripts/db/20210225101205_add_articles_indices.js

db.articles.createIndex(
  {
    partner_channel_id: 1,
    tags: 1,
    featured: 1,
    published: 1,
    published_at: -1
  },
  { background: true }
)

db.articles.createIndex(
  {
    channel_id: 1,
    tags: 1,
    featured: 1,
    published: 1,
    published_at: -1
  },
  { background: true }
)
