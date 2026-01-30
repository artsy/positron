# Article-Artwork Relationships Reference

## Overview

Articles relate to artworks in **two ways**:

1. **`featured_artwork_ids`**: ObjectId references to Gravity's artwork database, aka "featured" artworks
2. **Embedded in sections**: Denormalized artwork data copied into article content, aka "mentioned" artworks

## Data Model

### Featured Artworks (ID References)

```javascript
{
  featured_artwork_ids: [
    ObjectId("5446f9957261696977d80000"),
    ObjectId("546b8a417261693348b40000"),
  ]
}
```

### Embedded Artworks (in Sections)

```javascript
{
  "sections": [{
    "type": "image_collection",
    "images": [{
      "id": "4ddab4e73140b30001000844",  // String ID, not ObjectId
      "type": "artwork",
      "title": "We Don't Want to Stop",
      "slug": "shi-yong-we-dont-want-to-stop",
      "image": "https://d32dm0rphc51dk.cloudfront.net/.../larger.jpg",
      "artists": [{ "name": "Shi Yong", "slug": "shi-yong" }],
      "partner": { "name": "ShanghART", "slug": "shanghart" }
    }]
  }]
}
```

**Note**: Embedded data is a snapshot at embedding time—may be stale.

## Featured vs. Mentioned Artworks

The CMS distinguishes between two categories of artworks in the "Featuring" section:

### Featured Artworks

- Appear at the top of the "Artworks" section in the CMS
- Stored in the `featured_artwork_ids` array (ObjectIds)
- These are the primary artworks highlighted in the article
- Often (but not always) also embedded in article sections

### Mentioned Artworks

- Appear below featured artworks, labeled as "Mentioned"
- These are artworks embedded in article sections (`sections.images` where `type === "artwork"`)
- BUT **not** included in `featured_artwork_ids`
- Represent artworks referenced in the article content but not primary focus

### Important: Overlap Between Systems

An artwork can be both featured AND embedded:

- If an artwork's ObjectId is in `featured_artwork_ids` AND embedded in sections, it's "featured"
- If an artwork is embedded in sections but NOT in `featured_artwork_ids`, it's "mentioned"

### Query Pattern: Separate Featured and Mentioned

```javascript
const article = db.articles.findOne({
  _id: ObjectId("64da9709b5a76e0020f0d6d7"),
})

// Get featured artwork IDs as strings
const featuredIds = (article.featured_artwork_ids || []).map(id =>
  id.toString()
)

// Collect embedded artworks from sections
const embeddedArtworks = []
article.sections.forEach(s => {
  if (s.images) {
    s.images.forEach(img => {
      if (img.type === "artwork") {
        embeddedArtworks.push({
          id: img.id,
          slug: img.slug,
          title: img.title,
        })
      }
    })
  }
})

// Separate mentioned artworks (embedded but not featured)
const mentionedArtworks = embeddedArtworks.filter(
  aw => featuredIds.indexOf(aw.id) === -1
)

// Result:
// - featuredIds: artworks in the "Featured" section
// - mentionedArtworks: artworks in the "Mentioned" section
```

## Key Statistics as of 2026-01

- **8,819 published articles** have `featured_artwork_ids` (29.1%)
- **26,922 total featured artworks** across all articles
- **Average: 3.05 artworks** per article (among articles with artworks)
- **21,485 articles** use `image_collection` sections (may contain artworks)

## Query Patterns

### Find articles by featured artwork ID

```javascript
db.articles.find({
  published: true,
  featured_artwork_ids: ObjectId("5446f9957261696977d80000"),
})
```

### Find most-featured artworks

```javascript
db.articles.aggregate([
  { $match: { published: true } },
  { $unwind: "$featured_artwork_ids" },
  {
    $group: {
      _id: "$featured_artwork_ids",
      article_count: { $sum: 1 },
    },
  },
  { $sort: { article_count: -1 } },
  { $limit: 50 },
])
```

### Find articles with many featured artworks

```javascript
db.articles.aggregate([
  { $match: { published: true, featured_artwork_ids: { $exists: true } } },
  {
    $project: {
      title: 1,
      count: { $size: { $ifNull: ["$featured_artwork_ids", []] } },
    },
  },
  { $match: { count: { $gte: 10 } } },
  { $sort: { count: -1 } },
])
```

### Find articles with embedded artwork (by ID)

```javascript
// Note: embedded artwork IDs are STRINGS, not ObjectIds
db.articles.find({
  published: true,
  "sections.images.id": "4ddab4e73140b30001000844",
})
```

### Find articles with any embedded artworks

```javascript
db.articles.find({
  published: true,
  "sections.images.type": "artwork",
})
```

## Critical Notes

1. **Use ObjectId for `featured_artwork_ids`**:

   ```javascript
   // Correct
   featured_artwork_ids: ObjectId("5446f9957261696977d80000")
   // Wrong
   featured_artwork_ids: "5446f9957261696977d80000"
   ```

2. **Use String for embedded artwork IDs**:

   ```javascript
   // Correct
   "sections.images.id": "4ddab4e73140b30001000844"
   // Wrong
   "sections.images.id": ObjectId("4ddab4e73140b30001000844")
   ```

3. **Two independent systems**: An article can have `featured_artwork_ids` without embedding artworks, or embed artworks without listing them in `featured_artwork_ids`

4. **Handle empty/null**: Field can be missing, null, or empty array

   ```javascript
   db.articles.find({
     published: true,
     featured_artwork_ids: { $type: "array", $ne: [] },
   })
   ```

5. **Section types with artworks**: `image_collection`, `image_set`, `slideshow`
