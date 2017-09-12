import User from 'api/apps/users/model.coffee'
import { mongoFetch, present, presentCollection, find } from 'api/apps/articles/model/index.coffee'
import Curation from 'api/apps/curations/model.coffee'
import Channel from 'api/apps/channels/model.coffee'
import Tag from 'api/apps/tags/model.coffee'
import Author from 'api/apps/authors/model.coffee'

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
    mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error('Articles not found.'))
      }
      resolve(presentCollection(results).results)
    })
  })
}

export const article = (root, args, req, ast) => {
  return new Promise((resolve, reject) => {
    find(args.id, async (err, result) => {
      if (err) {
        reject(new Error(err))
      }
      if (result) {
        const unpublished = !result.published || result.scheduled_publish_at
        const unauthorized = !User.hasChannelAccess(req.user, result.channel_id)
        if (unpublished && unauthorized) {
          reject(new Error('Must be a member of the channel to view an unpublished article.'))
        } else {
          try {
            const related = await relatedArticles(result)
            if (related && related.results.length) {
              result.relatedArticles = presentCollection(related).results
            }
            resolve(present(result))
          } catch (err) {
            reject(new Error(err))
          }
        }
      } else {
        reject(new Error('Article not found.'))
      }
    })
  })
}

// export const article = (root, args, req, ast) => {
//   return new Promise((resolve, reject) => {
//     find(args.id, (err, result) => {
//       if (err) {
//         reject(new Error(err))
//       }
//       if (result) {
//         const unpublished = !result.published || result.scheduled_publish_at
//         const unauthorized = !User.hasChannelAccess(req.user, result.channel_id)
//         if (unpublished && unauthorized) {
//           reject(new Error('Must be a member of the channel to view an unpublished article.'))
//         } else {
//           resolve(present(result))
//         }
//       } else {
//         reject(new Error('Article not found.'))
//       }
//     })
//   })
// }

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

const relatedArticles = ({id, channel_id, tags}) => {
  const args = {
    omit: [id],
    published: true,
    channel_id,
    tags,
    limit: 5
  }
  return new Promise((resolve, reject) => {
    mongoFetch(args, (err, results) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(results)
    })
  })
}
