express = require 'express'
graphqlHTTP = require 'express-graphql'
{ models, connect } = require 'joiql-mongo'
Article = require './models/article'

app = module.exports = express()
api = models(Article)

app.use '/graphql', graphqlHTTP(schema: api.schema, graphiql: true)
connect(process.env.MONGOHQ_URL)
