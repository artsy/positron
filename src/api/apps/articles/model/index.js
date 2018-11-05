//
// Library of retrieval, persistance, validation, json view, and domain logic
// for the "articles" resource.
//
import _ from "underscore"
import async from "async"
import { cloneDeep } from "lodash"
import schema from "./schema.coffee"
import Joi from "../../../lib/joi.coffee"
import retrieve from "./retrieve.coffee"
import { ObjectId } from "mongojs"
import moment from "moment"
const db = require("../../../lib/db.coffee")
const {
  onPublish,
  generateSlugs,
  generateKeywords,
  sanitizeAndSave,
  onUnpublish,
} = require("./save.coffee")
const {
  removeFromSearch,
  deleteArticleFromSailthru,
  getArticleUrl,
} = require("./distribute.coffee")

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
  const { query, limit, offset, sort, count } = retrieve.toQuery(input)
  const cursor = db.articles
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
        return db.articles.count(cb)
      },
      cb => {
        if (!count) {
          return cb()
        }
        return cursor.count(cb)
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
  const { query, limit, offset, sort, count } = retrieve.toQuery(input)
  const cursor = db.articles
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
          return db.articles.count(cb)
        },
        cb => {
          if (!count) {
            return cb()
          }
          return cursor.count(cb)
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
  const query = ObjectId.isValid(id) ? { _id: ObjectId(id) } : { slugs: id }
  db.articles.findOne(query, callback)
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
        const publishing =
          (modifiedArticle.published && !article.published) ||
          (modifiedArticle.scheduled_publish_at && !article.published)
        const unPublishing = article.published && !modifiedArticle.published
        const hasSlugs =
          modifiedArticle.slugs && modifiedArticle.slugs.length > 0
        if (publishing) {
          return onPublish(modifiedArticle, sanitizeAndSave(callback))
        } else if (unPublishing) {
          return onUnpublish(modifiedArticle, sanitizeAndSave(callback))
        } else if (!publishing && !hasSlugs) {
          return generateSlugs(modifiedArticle, sanitizeAndSave(callback))
        } else {
          return sanitizeAndSave(callback)(null, modifiedArticle)
        }
      })
    })
  })
}

export const publishScheduledArticles = callback => {
  db.articles.find(
    { scheduled_publish_at: { $lt: new Date() } },
    (err, articles) => {
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
          return onPublish(article, sanitizeAndSave(cb))
        },
        (err, results) => {
          if (err) {
            return callback(err, [])
          }
          return callback(null, results)
        }
      )
    }
  )
}

export const unqueue = callback => {
  db.articles.find(
    { $or: [{ weekly_email: true }, { daily_email: true }] },
    (err, articles) => {
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
    }
  )
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

    const url = getArticleUrl(article)
    deleteArticleFromSailthru(url, () => {
      db.articles.remove({ _id: ObjectId(id) }, (err, res) => {
        if (err) {
          return callback(err)
        }
        removeFromSearch(id.toString())
        return callback(null)
      })
    })
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
    db.articles
      .find({ "super_article.related_articles": ObjectId(id) })
      .count((err, count) => {
        if (err) {
          return reject(err)
        }
        resolve(count)
      })
  })
}

export const backfill = callback => {
  // Modify the query to match the articles that need backfilling
  const query = {
    published: true,
  }

  db.articles.find(query).toArray((err, articles) => {
    if (err) {
      return callback(err)
    }
    if (articles.length === 0) {
      return callback(null, [])
    }

    console.log(`There are ${articles.length} articles to backfill...`)

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
          `Backfilling article: ${article.slugs[article.slugs.length - 1]}`
        )

        /*
        Write backfill logic here. Make sure to callback with cb()
        eg: distributeArticle(article,cb)
      */
      },
      (err, results) => {
        console.log(err)
        callback()
      }
    )
  })
}
