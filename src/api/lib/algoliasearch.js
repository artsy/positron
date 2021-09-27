const algoliasearch = require("algoliasearch")

const client = algoliasearch("placeholder", "placeholder")
const index = client.initIndex("placeholder")

module.exports = { client, index }
