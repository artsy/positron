---
name: query-positron
description: Transforms natural language input into valid MongoDB queries for interrogating Positron's database, issues them to our Mongo cluster, retrieves and optionally analyzes or transforms the results. Use when the user wants to know about Positron's actual data about articles, authors, channels, verticals etc.
allowed-tools: Bash(.claude/skills/query-positron/scripts/exec.sh:*)
---

# Ask Positron

Construct valid MongoDB queries, issue them and present or analyze or transform the results.

- Use the wrapper script at `.claude/skills/query-positron/scripts/exec.sh` to execute queries.

- The script handles connection setup and validates that `mongosh` is installed.

## Examples

### User question: "How many published articles are there?"

```sh
.claude/skills/query-positron/scripts/exec.sh "db.articles.countDocuments({ published: true })"
```

### User question: "Give me the most recent published article where layout is video"

```sh
.claude/skills/query-positron/scripts/exec.sh 'db.articles.find( { published: true, layout: "video" } ).sort({ published_at: 1 }).limit(1)'
```

### User question: "Count up the number of published articles for each layout value"

```sh
.claude/skills/query-positron/scripts/exec.sh 'db.articles.aggregate([ { $match: { published: true } }, { $group: { _id: "$layout", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $project: { _id: 0, layout: "$_id", count: 1 } } ])'
```

## General Rules

- Prefer simple queries when they will suffice, but use aggregation pipelines when necessary

- Format your queries as one-liners, to help avoid shell issues

- But if asked by the user to show your query, do so pretty-printed with concise comments ESPECIALLY for aggregation pipeline stages

- Transform Mongo's results into VALID json

  - Ensure keys are quoted
  - No ObjectId, ISODate, etc. Transform those values to plain strings.
  - Do not use the `--json` flag as this often fails to serialize correctly

- When querying by id, remember to wrap the id in Mongo's ObjectId function

  - Wrong ❌ `db.articles.findOne({ _id: "696921ff5c8bc6fecf779dad" })`
  - Right ✅ `db.articles.findOne({ _id: ObjectId("696921ff5c8bc6fecf779dad") })`

- When asked for urls, note the following patterns:

  - Public article urls `https://www.artsy.net/article/{ARTICLE_SLUG}/edit`
  - Admin editing urls `https://writer.artsy.net/articles/{ARTICLE_ID}/edit`
  - Artwork urls `https://www.artsy.net/artwork/{ARTWORK_ID_OR_SLUG}/edit`

## Articles

See the [example article](./references/example-article.md) to understand the shape of a typical document from the `articles` collection

This will be the subject of most queries.

Article-specific rules:

- Assume the user is only interested in articles where `published: true`, unless they explicitly tell you otherwise.
- The singular `slug` field is not reliable, instead we want to treat the final entry in the `slugs` array as the canonical slug.

### Article Authorship Fields

Articles contain multiple author-related fields that serve different purposes:

#### Display Attribution

- **`author`**: Object containing the organizational/editorial account (typically "Artsy Editorial")

  - `author.name`: Display name (e.g., "Artsy Editorial")
  - `author.id`: Gravity user ID for this account

- **`contributing_authors`**: Array of individual writer(s) who should be credited on the article
  - Each entry has `name` and `id` (Gravity user ID)
  - This field determines the byline shown to users on the website
  - **WARNING**: Often empty even when articles have actual authors

#### Author ID Fields

Articles store author references using multiple ID systems:

- **`author_ids`** (array): Positron's internal author record IDs from the `authors` collection

  - **This is the authoritative source for author attribution**
  - Use for lookups/joins with the `authors` collection to get actual author names

- **`author.id`** and **`contributing_authors[].id`**: Gravity user IDs

  - Use for Gravity API calls or authentication-related queries

- **`author_id`** (singular): Legacy field, purpose varies

#### Best Practice: Getting Author Names

To get correct author attribution, use an aggregation pipeline with `$lookup` to join with the `authors` collection:

```javascript
db.articles.aggregate([
  { $match: { published: true } },
  {
    $lookup: {
      from: "authors",
      localField: "author_ids",
      foreignField: "_id",
      as: "author_records",
    },
  },
  // Then use this priority for display:
  // 1. contributing_authors[0].name (if array is non-empty)
  // 2. author_records[0].name (from the lookup)
  // 3. author.name (fallback)
])
```

**Do NOT rely solely on `contributing_authors` or `author.name`** - they may not reflect the actual article author. Always join with the `authors` collection using `author_ids`.

## Additional Mongo collections

Here is a list of all collections in Positron’s MongoDB.

Most of the time you will be interested in articles, but these others are available as well:

```
articles
authors
channels
curations
organizations
sections
sessions
tags
users
verticals
```

You can inspect any of these collections’ document shapes by requesting the most recent documents, e.g:

```sh
.claude/skills/query-positron/scripts/exec.sh 'db.authors.find().sort({ _id: -1 }).limit(3)'
```
