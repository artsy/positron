# Partner-authored Article Problem

## Overview

Partner publishing was discontinued years ago, but access controls were not enforced. As a result, some partners continue to publish articles through Positron. These articles are **misattributed as "Artsy Editors"** on the frontend despite having partner names in the database.

**Scale:** 861 partners have published 5,382 articles historically. 8 partners published 53 unauthorized articles in 2025-2026.

## How to Identify Partner-authored Articles

**Key indicators:**

- `partner_channel_id` is present (not null)
- `channel_id` is typically null
- `layout` is almost always `"classic"` (99.9% of partner articles)
- `author.name` contains the partner/gallery name

**Editorial articles by contrast have:**

- `channel_id` present (not null)
- `partner_channel_id` is null
- `layout` is standard, news, feature, series, or video

## Query Examples

### Find all partner-authored articles

```javascript
db.articles.find({
  published: true,
  partner_channel_id: { $ne: null },
})
```

### Find recent unauthorized publishing (2024+)

```javascript
db.articles
  .find({
    published: true,
    partner_channel_id: { $ne: null },
    published_at: { $gte: new ISODate("2024-01-01") },
  })
  .sort({ published_at: -1 })
```

### List active unauthorized publishers

```javascript
db.articles.aggregate([
  {
    $match: {
      published: true,
      partner_channel_id: { $ne: null },
      published_at: { $gte: new ISODate("2024-01-01") },
    },
  },
  {
    $group: {
      _id: "$partner_channel_id",
      author_name: { $first: "$author.name" },
      count: { $sum: 1 },
      latest: { $max: "$published_at" },
    },
  },
  { $sort: { count: -1 } },
])
```

## Attribution Masking

Partner articles display **"Artsy Editors"** as the byline on artsy.net, despite `author.name` containing the actual partner name in the database. This masks unauthorized authorship.

Example:

- Database: `author.name: "JoAnne Artman Gallery"`
- Frontend: "Artsy Editors"

## Search Behavior

Classic layout articles (99.9% of partner content) are **not indexed for search**. This accidentally limits discoverability of unauthorized content but also affects legitimate historical partner articles.
