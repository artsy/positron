const algoliasearch = require("algoliasearch")

const { NODE_ENV, ALGOLIA_APP_ID, ALGOLIA_API_KEY } = process.env

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY)
const index = client.initIndex(`Article_${NODE_ENV}`)

module.exports = { client, index }
