import _ from 'underscore'
const User = require('api/apps/users/model.coffee')
const Curation = require('api/apps/curations/model.coffee')
const Channel = require('api/apps/channels/model.coffee')
const Tag = require('api/apps/tags/model.coffee')
const Author = require('api/apps/authors/model.coffee')
const { mongoFetch, present, presentCollection, find } = require('api/apps/articles/model/index.coffee')
const { ObjectId } = require('mongojs')

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
    Curation.mongoFetch({'type': 'display-admin'}, (err, results) => { // TODO - Use env var
      if (err) {
        reject(new Error(err))
      }
      const outcomes = []
      results.results[0].campaigns.map(campaign => {
        outcomes.push(_.times((campaign.sov * 100), () => campaign.name))
      })
      const result = _.sample(_.flatten(outcomes))
      const data = _.where(results.results[0].campaigns, {name: result})
      resolve(data)
    })
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

export const relatedArticlesPanel = (root) => {
  const tags = root.tags || null
  const args = {
    omit: [ObjectId(root.id)],
    published: true,
    featured: true,
    channel_id: ObjectId(root.channel_id),
    tags: tags,
    limit: 3,
    sort: '-published_at'
  }
  return new Promise((resolve, reject) => {
    mongoFetch(_.pick(args, _.identity), (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
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
  return new Promise((resolve, reject) => {
    mongoFetch(_.pick(args, _.identity), (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results.results)
    })
  })
}
