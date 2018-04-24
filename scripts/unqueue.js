import { unqueue } from '../src/api/apps/articles/model'
import RavenServer from 'raven'
const { SENTRY_PRIVATE_DSN } = process.env

RavenServer.config(SENTRY_PRIVATE_DSN).install()
RavenServer.context(() => {
  unqueue((err, results) => {
    if (err) {
      console.log(err)
      return process.exit(err)
    }

    console.log(`Completed Unqueueing ${results.length} articles.`)
    return process.exit()
  })
})
