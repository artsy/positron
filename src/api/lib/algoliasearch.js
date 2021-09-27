const algoliasearch = require("algoliasearch")

const { NODE_ENV, ALGOLIA_APP_ID, ALGOLIA_API_KEY } = process.env

const client = algoliasearch(
  ALGOLIA_APP_ID || "placeholder",
  ALGOLIA_API_KEY || "placeholder"
)
const index = client.initIndex(`Articles_${NODE_ENV}`)

module.exports = { client, index }
