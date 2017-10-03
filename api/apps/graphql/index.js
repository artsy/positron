import express from 'express'
import graphqlHTTP from 'express-graphql'
import joiql from 'joiql'
import { object, array, string, boolean } from 'joi'
import Article from 'api/apps/articles/model/schema.coffee'
import Curation from 'api/apps/curations/model.coffee'
import Channel from 'api/apps/channels/model.coffee'
import Tag from 'api/apps/tags/model.coffee'
import Author from 'api/apps/authors/model.coffee'
import { setUser } from 'api/apps/users/routes.coffee'
import * as resolvers from 'api/apps/graphql/resolvers.js'

const app = module.exports = express()

const metaFields = {
  relatedArticlesCanvas: array().items(object(Article.inputSchema)).meta({
    name: 'RelatedArticlesCanvas',
    resolve: resolvers.relatedArticlesCanvas
  }),
  relatedArticlesPanel: array().items(object(Article.inputSchema)).meta({
    name: 'RelatedArticlesPanel',
    resolve: resolvers.relatedArticlesPanel
  }),
  is_super_sub_article: boolean()
}

const ArticleSchema = object(Article.inputSchema).concat(object(metaFields))

const schema = joiql({
  query: {
    articles: array().items(ArticleSchema).meta({
      args: Article.querySchema,
      resolve: resolvers.articles
    }),
    article: ArticleSchema.meta({
      args: {id: string()},
      resolve: resolvers.article
    }),
    curations: array().items(object(Curation.schema)).meta({
      args: Curation.querySchema,
      resolve: resolvers.curations
    }),
    channels: array().items(object(
      Channel.schema
    )).meta({
      args: Channel.querySchema,
      resolve: resolvers.channels
    }),
    tags: array().items(object(
      Tag.schema
    )).meta({
      args: Tag.querySchema,
      resolve: resolvers.tags
    }),
    authors: array().items(object(
      Author.schema
    )).meta({
      args: Author.querySchema,
      resolve: resolvers.authors
    })
  }
})

app.use('/graphql', setUser, graphqlHTTP({
  schema,
  graphiql: true,
  formatError: (error) => {
    return {
      message: error.message,
      locations: error.locations,
      stack: error.stack
    }
  }
}))
