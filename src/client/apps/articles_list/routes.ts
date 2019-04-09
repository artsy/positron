import { Lokka } from "lokka"
import { Transport } from "lokka-transport-http"
import { getSessionsForChannel } from "../websocket"
import { ArticlesListQuery as query } from "./query"

const { API_URL } = process.env

export const articles_list = (req, res, next) => {
  let published
  const channel_id = req.user.get("current_channel").id

  if (req.query.published === "false") {
    published = false
  } else {
    published = true
  }

  const theQuery = query(`published: ${published}, channel_id: "${channel_id}"`)

  const headers = { "X-Access-Token": req.user.get("access_token") }

  const client = new Lokka({
    transport: new Transport(API_URL + "/graphql", { headers }),
  })

  return client
    .query(theQuery)
    .then(result => {
      if (result.articles.length > 0) {
        return renderArticles(res, req, result, published)
      } else {
        const unpublishedQuery = query(
          `published: false, channel_id: "${channel_id}"`
        )
        return client.query(unpublishedQuery).then(results => {
          return renderArticles(res, req, results, false)
        })
      }
    })
    .catch(() => {
      return next()
    })
}

export const renderArticles = (res, req, result, published) => {
  const articles = result.articles || []
  res.locals.sd.ARTICLES = articles
  res.locals.sd.CURRENT_CHANNEL = req.user.get("current_channel")
  const channel = res.locals.sd.CURRENT_CHANNEL

  return getSessionsForChannel(channel, sessions => {
    res.locals.sd.ARTICLES_IN_SESSION = sessions
    res.locals.sd.HAS_PUBLISHED = published

    return res.render("index", {
      articles,
      current_channel: channel,
    })
  })
}
