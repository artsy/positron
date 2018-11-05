import { Lokka } from "lokka"
import { Transport } from "lokka-transport-http"
import query from "./query.coffee"
import { getSessionsForChannel } from "../websocket"

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
        return client.query(unpublishedQuery).then(result => {
          return renderArticles(res, req, result, false)
        })
      }
    })
    .catch(() => {
      return next()
    })
}

export const renderArticles = (res, req, result, published) => {
  res.locals.sd.ARTICLES = result.articles
  res.locals.sd.CURRENT_CHANNEL = req.user.get("current_channel")
  const channel = res.locals.sd.CURRENT_CHANNEL

  return getSessionsForChannel(channel, sessions => {
    res.locals.sd.ARTICLES_IN_SESSION = sessions
    res.locals.sd.HAS_PUBLISHED = published

    return res.render("index", {
      articles: result.articles || [],
      current_channel: channel,
    })
  })
}
