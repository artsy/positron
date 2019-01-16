db.users.createIndex({ access_token: 1 }, { background: true })

// Can't add due to limit of mongo indices
// db.articles.createIndex({ slugs: 1 }, { background: true })

db.articles.createIndex(
  {
    featured_artwork_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    partner_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    auction_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    is_super_article: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    partner_ids: 1,
    published: 1,
    published_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    fair_artsy_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    fair_programming_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    published: 1,
    published_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    show_ids: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)

db.articles.createIndex(
  {
    layout: 1,
    published: 1,
    updated_at: -1,
  },
  { background: true }
)
