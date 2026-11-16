//
// Library of retrieval, persistance, validation, json view, and domain logic
// for the "articles" resource.
//
import _ from "underscore"
import async from "async"
import { cloneDeep } from "lodash"
import { toQuery } from "./retrieve"
import { ObjectId } from "mongodb-legacy"
import moment from "moment"
import {
  onPublish,
  generateSlugs,
  generateKeywords,
  sanitizeAndSave,
  onUnpublish,
} from "./save.coffee"

const schema = require("./schema.coffee")
const Joi = require("../../../lib/joi.coffee")
const db = require("../../../lib/db.coffee")
const { removeFromSearch, getArticleUrl } = require("./distribute.coffee")
const Article = require("./../../../../api/models/article.coffee")

//
// Retrieval
//
export const where = (input, callback) => {
  return Joi.validate(
    input,
    schema.querySchema,
    { stripUnknown: true },
    (err, input) => {
      if (err) {
        return callback(err)
      }
      return mongoFetch(input, callback)
    }
  )
}

export const mongoFetch = (input, callback) => {
  const { query, limit, offset, sort, count } = toQuery(input)
  const cursor = db
    .collection("articles")
    .find(query)
    .skip(offset || 0)
    .sort(sort)
    .limit(limit)
  async.parallel(
    [
      cb => cursor.toArray(cb),
      cb => {
        if (!count) {
          return cb()
        }
        return db.collection("articles").countDocuments(cb)
      },
      cb => {
        if (!count) {
          return cb()
        }
        return db.collection("articles").countDocuments(query, cb)
      },
    ],
    (err, results) => {
      const [articles, total, articleCount] = results
      if (err) {
        return callback(err)
      }
      return callback(null, {
        results: articles,
        total,
        count: articleCount,
      })
    }
  )
}

export const promisedMongoFetch = input => {
  const { query, limit, offset, sort, count } = toQuery(input)
  const cursor = db
    .collection("articles")
    .find(query)
    .skip(offset || 0)
    .sort(sort)
    .limit(limit || 10)
  return new Promise((resolve, reject) => {
    async.parallel(
      [
        cb => cursor.toArray(cb),
        cb => {
          if (!count) {
            return cb()
          }
          return db.collection("articles").countDocuments(cb)
        },
        cb => {
          if (!count) {
            return cb()
          }
          return db.collection("articles").countDocuments(query, cb)
        },
      ],
      (err, results) => {
        const [articles, total, articleCount] = results
        if (err) {
          return reject(err)
        }
        return resolve({
          results: articles,
          total,
          count: articleCount,
        })
      }
    )
  })
}

export const find = (id, callback) => {
  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { slugs: id }
  db.collection("articles").findOne(query, callback)
}

// Count published articles per artist for many artists in one aggregation.
// Returns a map of { [artist_id]: count }, zero-filled for every requested id.
// Collapses Metaphysics' per-artist `counts.articles` fan-out into one request.
export const countsByArtist = (input, callback) => {
  const ids = (input.artist_ids || [])
    .filter(id => ObjectId.isValid(id))
    .map(id => new ObjectId(id))

  if (ids.length === 0) {
    return callback(null, {})
  }

  const match = {
    published: input.published == null ? true : input.published,
    $or: [
      { primary_featured_artist_ids: { $in: ids } },
      { featured_artist_ids: { $in: ids } },
      { biography_for_artist_id: { $in: ids } },
    ],
  }

  if (input.in_editorial_feed) {
    match.layout = { $in: ["feature", "standard", "series", "video"] }
  }

  // $setUnion dedupes so an article featuring an artist in more than one field
  // (e.g. both primary_featured and featured) counts once per artist.
  const pipeline = [
    { $match: match },
    {
      $project: {
        matchedArtists: {
          $setUnion: [
            {
              $setIntersection: [
                { $ifNull: ["$primary_featured_artist_ids", []] },
                ids,
              ],
            },
            {
              $setIntersection: [
                { $ifNull: ["$featured_artist_ids", []] },
                ids,
              ],
            },
            {
              $cond: [
                { $in: ["$biography_for_artist_id", ids] },
                ["$biography_for_artist_id"],
                [],
              ],
            },
          ],
        },
      },
    },
    { $unwind: "$matchedArtists" },
    { $group: { _id: "$matchedArtists", count: { $sum: 1 } } },
  ]

  db.collection("articles")
    .aggregate(pipeline)
    .toArray((err, rows) => {
      if (err) {
        return callback(err)
      }
      const counts = {}
      ids.forEach(id => {
        counts[id.toString()] = 0
      })
      rows.forEach(row => {
        counts[row._id.toString()] = row.count
      })
      return callback(null, counts)
    })
}

//
// Persistence
//
export const save = (input, accessToken, options, callback) => {
  // Validate the input with Joi
  const validationOptions = _.extend({ stripUnknown: true }, options.validation)
  Joi.validate(input, schema.inputSchema, validationOptions, (err, input) => {
    if (err) {
      return callback(err)
    }

    // Find the original article or create an empty one
    const articleId =
      input.id || input._id ? (input.id || input._id).toString() : null
    find(articleId, (err, article) => {
      if (article == null) {
        article = {}
      }
      if (err) {
        return callback(err)
      }
      // Create a new article by merging the values of input and article
      const modifiedArticle = _.extend(cloneDeep(article), input)

      generateKeywords(input, modifiedArticle, (err, modifiedArticle) => {
        if (err) {
          return callback(err)
        }

        // Eventually convert these to Joi custom extensions
        modifiedArticle.updated_at = new Date()

        if (input.author) {
          modifiedArticle.author = input.author
        }

        // Handle publishing, unpublishing, published, draft
        const publishing = modifiedArticle.published && !article.published
        const scheduledPublishing =
          modifiedArticle.scheduled_publish_at && !article.published
        const unPublishing = article.published && !modifiedArticle.published
        const hasSlugs =
          modifiedArticle.slugs && modifiedArticle.slugs.length > 0
        if (publishing) {
          return onPublish(modifiedArticle, postPublishCallback(callback))
        } else if (scheduledPublishing) {
          return onPublish(modifiedArticle, sanitizeAndSave(callback))
        } else if (unPublishing) {
          return onUnpublish(modifiedArticle, sanitizeAndSave(callback))
        } else if (!(publishing || scheduledPublishing) && !hasSlugs) {
          return generateSlugs(modifiedArticle, sanitizeAndSave(callback))
        } else {
          return sanitizeAndSave(callback)(null, modifiedArticle)
        }
      })
    })
  })
}

export const publishScheduledArticles = callback => {
  db.collection("articles")
    .find({ scheduled_publish_at: { $lt: new Date() } })
    .toArray() // I believe the old find returned the array, not the cursor.
    .then((articles, err) => {
      if (err) {
        return callback(err, [])
      }
      if (articles.length === 0) {
        return callback(null, [])
      }
      async.map(
        articles,
        (article, cb) => {
          article = _.extend(article, {
            published: true,
            published_at: moment(article.scheduled_publish_at).toDate(),
            scheduled_publish_at: null,
          })
          return onPublish(article, postPublishCallback(cb))
        },
        (err, results) => {
          if (err) {
            return callback(err, [])
          }
          return callback(null, results)
        }
      )
    })
}

export const unqueue = callback => {
  db.collection("articles")
    .find({ $or: [{ weekly_email: true }, { daily_email: true }] })
    .toArray()
    .then((articles, err) => {
      if (err) {
        return callback(err, [])
      }
      if (articles.length === 0) {
        return callback(null, [])
      }
      async.map(
        articles,
        (article, cb) => {
          article = _.extend(article, {
            weekly_email: false,
            daily_email: false,
          })
          return onPublish(article, sanitizeAndSave(cb))
        },
        (err, results) => {
          if (err) {
            return callback(err, [])
          }
          return callback(null, results)
        }
      )
    })
}

//
// Destroy
//
export const destroy = (id, callback) => {
  find(id, (err, article) => {
    if (err) {
      return callback(err)
    }
    if (!article) {
      return callback(new Error("Article not found."))
    }

    db.collection("articles").deleteOne(
      { _id: new ObjectId(id) },
      (err, res) => {
        if (err) {
          return callback(err)
        }
        removeFromSearch(id.toString())
        return callback(null)
      }
    )
  })
}

//
// JSON views
//
export const presentCollection = articles => {
  const results = _.map(articles.results, present)
  return {
    total: articles.total,
    count: articles.count,
    results,
  }
}

export const present = article => {
  if (!article) {
    return {}
  }
  const id = article._id ? article._id.toString() : null
  const scheduled_publish_at = article.scheduled_publish_at
    ? moment(article.scheduled_publish_at).toISOString()
    : null
  const published_at = article.published_at
    ? moment(article.published_at).toISOString()
    : null
  const updated_at = article.updated_at
    ? moment(article.updated_at).toISOString()
    : null
  return _.extend(article, {
    id,
    _id: id,
    slug: _.last(article.slugs),
    slugs: undefined,
    published_at,
    scheduled_publish_at,
    updated_at,
  })
}

export const getSuperArticleCount = id => {
  return new Promise((resolve, reject) => {
    if (!ObjectId.isValid(id)) {
      return resolve(0)
    }
    const query = { "super_article.related_articles": new ObjectId(id) }
    db.collection("articles").countDocuments(query, (err, count) => {
      if (err) {
        return reject(err)
      }
      return resolve(count)
    })
  })
}

export const backfill = callback => {
  // Modify the query to match the articles that need backfilling
  const query = {
    published: true,
  }
  db.collection("articles")
    .find(query)
    .toArray((err, articles) => {
      if (err) {
        return callback(err)
      }
      if (articles.length === 0) {
        return callback(null, [])
      }

      // Loop through found articles and do something with them
      async.mapSeries(
        articles,
        (article, cb) => {
          console.log("---------------------")
          console.log("---------------------")
          console.log("---------------------")
          console.log("---------------------")
          console.log("---------------------")
          console.log("---------------------")
          console.log(
            `Backfilling article: ${articles.indexOf(article) + 1} of ${
              articles.length
            }, ${article.slugs[article.slugs.length - 1]}, published at ${
              article.published_at
            }`
          )

          /*
        Write backfill logic here. Make sure to callback with cb()
        eg: sanitizeAndSave(cb)(null, article)
      */
        },
        (err, results) => {
          console.log(err)
          callback()
        }
      )
    })
}

const postPublishCallback = callback => {
  return (err, article) => {
    const cb = sanitizeAndSave((err, article) => {
      if (err) {
        return callback(err)
      }

      const model = new Article(cloneDeep(article))
      model.dispatchPublishEvent()
      callback(null, article)
    })
    cb(err, article)
  }
}
