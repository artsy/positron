import _ from 'underscore'
import moment from 'moment'
const Author = require('api/apps/authors/model.coffee')
const Channel = require('api/apps/channels/model.coffee')
const Curation = require('api/apps/curations/model.coffee')
const Tag = require('api/apps/tags/model.coffee')
const User = require('api/apps/users/model.coffee')
const { promisedMongoFetch, mongoFetch, present, presentCollection, find } = require('api/apps/articles/model/index.js')
const { ObjectId } = require('mongojs')
const { DISPLAY_ID } = process.env

export const articles = (root, args, req, ast) => {
  const unpublished = !args.published || args.scheduled
  if (unpublished && !args.channel_id) {
    throw new Error('Must pass channel_id to view unpublished articles. Or pass ' +
      'published: true to only view published articles.'
    )
  }

  const unauthorized = !User.hasChannelAccess(req.user, args.channel_id)
  if (unpublished && unauthorized) {
    throw new Error('Must be a member of this channel to view unpublished articles. ' +
      'Pass published: true to only view published articles.'
    )
  }
  return new Promise((resolve, reject) => {
    mongoFetch(args, (err, res) => {
      if (err) {
        reject(new Error('Articles not found.'))
      }
      resolve(presentCollection(res).results)
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
          reject(new Error('Must be a member of the channel to view an unpublished article.'))
        } else {
          resolve(present(result))
        }
      } else {
        reject(new Error('Article not found.'))
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

export const relatedAuthors = (root) => {
  const args = {
    ids: root.author_ids
  }
  return new Promise(async (resolve, reject) => {
    if (args.ids && args.ids.length) {
      Author.mongoFetch(args, (err, {results}) => {
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

export const display = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    Curation.mongoFetch({
      '_id': ObjectId(DISPLAY_ID)
    }, (err, { results }) => {
      if (err) { reject(new Error(err)) }

      const outcomes = []
      results[0].campaigns.map((campaign, i) => {
        const weightedCampaignArray = _.times((campaign.sov * 100), () => campaign.name)
        outcomes.push(...weightedCampaignArray)
      })

      if (outcomes.length > 100) {
        reject(new Error('Share of voice sum cannot be greater than 100'))
      } else if (outcomes.length < 100) {
        const weightedEmptyArray = _.times((100 - outcomes.length), () => 0)
        outcomes.push(...weightedEmptyArray)
      }

      const result = _.sample(outcomes)

      if (result === 0) {
        resolve(null)
      } else {
        const campaign = _.findWhere(results[0].campaigns, { name: result })
        const { start_date, end_date } = campaign

        // Only return results that start or end after now
        const now = moment(new Date())
        const startsAfterNow = moment(start_date).isAfter(now)
        const endsBeforeNow = moment(end_date).isBefore(now)

        if (startsAfterNow || endsBeforeNow) {
          resolve(null)
        } else {
          resolve(campaign)
        }
      }
    })
  })
}

export const relatedArticlesPanel = (root) => {
  const omittedIds = [ObjectId(root.id)]
  if (root.related_articles_ids) {
    omittedIds.concat(root.related_article_ids)
  }
  const tags = (root.tags && root.tags.length > 0) ? root.tags : null

  const args = {
    omit: omittedIds,
    published: true,
    featured: true,
    channel_id: ObjectId(root.channel_id),
    tags: tags,
    limit: 3,
    sort: '-published_at'
  }

  const relatedArticleArgs = {
    ids: root.related_article_ids,
    limit: 3,
    published: true
  }

  return new Promise(async (resolve, reject) => {
    let relatedArticles = []

    const articleResults = await promisedMongoFetch(_.pick(args, _.identity))
    .catch((e) => reject(e))

    if (root.related_article_ids && root.related_article_ids.length) {
      const relatedArticleResults = await promisedMongoFetch(relatedArticleArgs)
      .catch((e) => reject(e))
      relatedArticles = _.first(
        relatedArticleResults.results.concat(presentCollection(articleResults).results),
        3
      )
    } else {
      relatedArticles = presentCollection(articleResults).results
    }

    if (relatedArticles.length) {
      resolve(relatedArticles)
    } else {
      resolve(null)
    }
  })
}

export const relatedArticlesCanvas = (root) => {
  const vertical = root.vertical && root.vertical.id ? ObjectId(root.vertical.id) : null
  const args = {
    omit: [ObjectId(root.id)],
    published: true,
    featured: true,
    channel_id: ObjectId(root.channel_id),
    vertical,
    limit: 4,
    sort: '-published_at'
  }

  return new Promise(async (resolve, reject) => {
    const relatedArticles = await promisedMongoFetch(_.pick(args, _.identity))
    .catch((e) => reject(e))
    if (relatedArticles.results.length) {
      resolve(presentCollection(relatedArticles).results)
    } else {
      resolve(null)
    }
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
