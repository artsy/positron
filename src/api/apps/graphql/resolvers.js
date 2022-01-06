import _ from "underscore"
const Author = require("api/apps/authors/model.coffee")
const Channel = require("api/apps/channels/model.coffee")
const Curation = require("api/apps/curations/model.coffee")
const Tag = require("api/apps/tags/model.coffee")
const User = require("api/apps/users/model.coffee")
const {
  promisedMongoFetch,
  mongoFetch,
  present,
  presentCollection,
  find,
} = require("api/apps/articles/model/index.js")
const { ObjectId } = require("mongojs")

export const articles = (root, args, req, ast) => {
  const unpublished = !args.published || args.scheduled
  if (unpublished && !args.channel_id) {
    throw new Error(
      "Must pass channel_id to view unpublished articles. Or pass " +
        "published: true to only view published articles."
    )
  }

  const unauthorized = !User.hasChannelAccess(req.user, args.channel_id)
  if (unpublished && unauthorized) {
    throw new Error(
      "Must be a member of this channel to view unpublished articles. " +
        "Pass published: true to only view published articles."
    )
  }
  return new Promise((resolve, reject) => {
    mongoFetch(args, (err, res) => {
      if (err) {
        reject(new Error("Articles not found."))
      }
      // Add internalID for relay support
      res = {
        results: res.results.map(r => ({
          ...r,
          internalID: r._id,
        })),
      }

      const results = presentCollection(res).results
      resolve(results)
    })
  })
}

export const article = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    find(args.id, (err, result) => {
      if (err) {
        reject(new Error(err))
      }
      if (result) {
        const unpublished = !result.published || result.scheduled_publish_at
        const unauthorized = !User.hasChannelAccess(req.user, result.channel_id)
        if (unpublished && unauthorized) {
          reject(
            new Error(
              "Must be a member of the channel to view an unpublished article."
            )
          )
        } else {
          result.internalID = result.id
          resolve(present(result))
        }
      } else {
        reject(new Error("Article not found."))
      }
    })
  })
}

export const authors = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    Author.mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
  })
}

export const relatedAuthors = root => {
  const args = {
    ids: root.author_ids,
  }

  return new Promise(async (resolve, reject) => {
    if (args.ids && args.ids.length) {
      Author.mongoFetch(args, (err, { results }) => {
        if (err) {
          reject(new Error(err))
        }
        if (results.length) {
          resolve(results)
        } else {
          resolve(null)
        }
      })
    } else {
      resolve(null)
    }
  })
}

export const curations = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    Curation.mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
  })
}

export const channels = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    Channel.mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
  })
}

export const articleChannel = root => {
  const args = {
    id: root.channel_id,
  }
  return new Promise((resolve, reject) => {
    Channel.find(args.id, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results)
    })
  })
}

export const relatedArticles = (root, args, req) => {
  const { related_article_ids } = root
  const relatedArticleArgs = {
    ids: related_article_ids,
    channel_id: ObjectId(root.channel_id),
  }
  const unauthorized = !User.hasChannelAccess(req.user, root.channel_id)
  if (unauthorized) {
    relatedArticleArgs.published = true
  }

  return new Promise(async (resolve, reject) => {
    let relatedArticles = []

    if (related_article_ids && related_article_ids.length) {
      relatedArticleArgs.limit = related_article_ids.length
      const relatedArticleResults = await promisedMongoFetch(
        relatedArticleArgs
      ).catch(e => reject(e))
      relatedArticles = presentCollection(relatedArticleResults).results
    }

    if (relatedArticles.length) {
      const relatedArticlesById = relatedArticles.reduce(
        (lookupIndex, val) => ({
          ...lookupIndex,
          [val.id]: val,
        }),
        {}
      )
      const output = related_article_ids.map(id => relatedArticlesById[id])
      resolve(output)
    } else {
      resolve(null)
    }
  })
}

export const relatedArticlesPanel = root => {
  let omittedIds = [ObjectId(root.id)]
  if (root.related_article_ids) {
    omittedIds = omittedIds.concat(root.related_article_ids)
  }
  const tags = root.tags && root.tags.length > 0 ? root.tags : null

  const args = {
    omit: omittedIds,
    published: true,
    featured: true,
    channel_id: ObjectId(root.channel_id),
    tags: tags,
    limit: 3,
    sort: "-published_at",
  }

  const relatedArticleArgs = {
    ids: root.related_article_ids,
    limit: 3,
    published: true,
    has_published_media: true,
  }

  return new Promise(async (resolve, reject) => {
    let relatedArticles = []

    const articleFeed = await promisedMongoFetch(
      _.pick(args, _.identity)
    ).catch(e => reject(e))

    if (root.related_article_ids && root.related_article_ids.length) {
      const relatedArticleResults = await promisedMongoFetch(
        relatedArticleArgs
      ).catch(e => reject(e))

      const mergedArticles = {
        results: relatedArticleResults.results.concat(articleFeed.results),
      }

      relatedArticles = presentCollection(mergedArticles).results
    } else {
      relatedArticles = presentCollection(articleFeed).results
    }

    if (relatedArticles.length) {
      resolve(_.first(relatedArticles, 3))
    } else {
      resolve(null)
    }
  })
}

export const relatedArticlesCanvas = root => {
  let omittedIds = [ObjectId(root.id)]
  if (root.related_article_ids) {
    omittedIds = omittedIds.concat(root.related_article_ids)
  }

  const vertical =
    root.vertical && root.vertical.id ? ObjectId(root.vertical.id) : null

  const args = {
    omit: omittedIds,
    published: true,
    featured: true,
    in_editorial_feed: true,
    channel_id: ObjectId(root.channel_id),
    vertical,
    limit: 4,
    sort: "-published_at",
    has_published_media: true,
  }

  const relatedArticleArgs = {
    ids: root.related_article_ids,
    limit: 4,
    published: true,
    has_published_media: true,
  }

  return new Promise(async (resolve, reject) => {
    let relatedArticles = []
    const articleFeed = await promisedMongoFetch(
      _.pick(args, _.identity)
    ).catch(e => reject(e))

    if (root.related_article_ids && root.related_article_ids.length) {
      const relatedArticleResults = await promisedMongoFetch(
        relatedArticleArgs
      ).catch(e => reject(e))

      const mergedArticles = {
        results: relatedArticleResults.results.concat(articleFeed.results),
      }

      relatedArticles = presentCollection(mergedArticles).results
    } else {
      relatedArticles = presentCollection(articleFeed).results
    }

    if (relatedArticles.length) {
      resolve(_.first(relatedArticles, 4))
    } else {
      resolve(null)
    }
  })
}

export const seriesArticle = root => {
  return new Promise(async (resolve, reject) => {
    const seriesArticles = await promisedMongoFetch({
      layout: "series",
    }).catch(e => reject(e))

    seriesArticles.results.map(article => {
      const stringifiedArticleIds = article.related_article_ids.map(id => {
        return id.toString()
      })
      if (_.contains(stringifiedArticleIds, root.id)) {
        resolve(present(article))
      }
    })
    resolve(null)
  })
}

export const tags = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    Tag.mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
  })
}
