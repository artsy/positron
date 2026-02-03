# Article-Artist Relationships Reference

## Overview

Articles relate to artists through **three ID reference fields** pointing to Artsy's artist database (Gravity). Only ID references are stored—no denormalized artist data.

## Data Model

```javascript
{
  primary_featured_artist_ids: [    // Active field for artist associations
    ObjectId("5447e1fb7261695ba2f00700"),
    ObjectId("4f552b2e3b5552417000007e")
  ],
  featured_artist_ids: [             // DEPRECATED - not used since 2024
    ObjectId("52910c9eb202a3c7db00035f")
  ],
  biography_for_artist_id: ObjectId("5447e1fb7261695ba2f00700")  // Single artist for biography articles
}
```

## Key Statistics as of 2026-01

- **5,073 published articles** have `primary_featured_artist_ids` (16.8%)
- **17,497 total artist references** across all articles
- **Average: 3.45 artists** per article (among articles with artists)
- **`featured_artist_ids` is deprecated** - not used since 2024, but still exists in old data
- **Only 9 articles** use `biography_for_artist_id`

## Query Patterns

### Find articles by artist ID

```javascript
db.articles.find({
  published: true,
  primary_featured_artist_ids: ObjectId("5447e1fb7261695ba2f00700"),
})
```

### Find articles featuring multiple specific artists

```javascript
db.articles.find({
  published: true,
  primary_featured_artist_ids: {
    $all: [
      ObjectId("5447e1fb7261695ba2f00700"),
      ObjectId("4f552b2e3b5552417000007e"),
    ],
  },
})
```

### Count articles per artist (most-featured artists)

```javascript
db.articles.aggregate([
  { $match: { published: true } },
  { $unwind: "$primary_featured_artist_ids" },
  {
    $group: {
      _id: "$primary_featured_artist_ids",
      article_count: { $sum: 1 },
    },
  },
  { $sort: { article_count: -1 } },
  { $limit: 50 },
])
```

### Find articles with many featured artists

```javascript
db.articles.aggregate([
  {
    $match: {
      published: true,
      primary_featured_artist_ids: { $type: "array" },
    },
  },
  {
    $project: {
      title: 1,
      artist_count: {
        $size: { $ifNull: ["$primary_featured_artist_ids", []] },
      },
    },
  },
  { $match: { artist_count: { $gte: 10 } } },
  { $sort: { artist_count: -1 } },
])
```

### Search all artist fields (backward compatible)

```javascript
db.articles.find({
  published: true,
  $or: [
    { primary_featured_artist_ids: ObjectId("5447e1fb7261695ba2f00700") },
    { featured_artist_ids: ObjectId("5447e1fb7261695ba2f00700") },
    { biography_for_artist_id: ObjectId("5447e1fb7261695ba2f00700") },
  ],
})
```

## Critical Notes

1. **Use ObjectId, not strings**: Artist IDs are stored as ObjectIds

   ```javascript
   // Correct
   primary_featured_artist_ids: ObjectId("5447e1fb7261695ba2f00700")
   // Wrong
   primary_featured_artist_ids: "5447e1fb7261695ba2f00700"
   ```

2. **Use `primary_featured_artist_ids`**: The `featured_artist_ids` field is deprecated

3. **Handle empty/null**: Field can be missing, null, or empty array

   ```javascript
   // Articles with at least one featured artist
   db.articles.find({
     published: true,
     primary_featured_artist_ids: { $type: "array", $ne: [] },
   })
   ```

4. **No artist names stored**: Must fetch from Gravity API using the IDs
