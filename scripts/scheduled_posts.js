import { publishScheduledArticles } from '../src/api/apps/articles/model/index.js'
import RavenServer from 'raven'
const { SENTRY_PRIVATE_DSN } = process.env

RavenServer.config(SENTRY_PRIVATE_DSN).install()
RavenServer.context(() => {
  publishScheduledArticles((err, results) => {
    if (err) {
      console.log(err)
    }

    console.log(`Completed Scheduling ${results.length} articles.`)
    return process.exit()
  })
})
