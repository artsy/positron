import express from "express"
import graphqlHTTP from "express-graphql"
import joiql from "joiql"
import { object, array, string, boolean } from "joi"
import { getSuperArticleCount } from "api/apps/articles/model"
import Article from "api/apps/articles/model/schema.coffee"
import Author from "api/apps/authors/model.coffee"
import Channel from "api/apps/channels/model.coffee"
import Curation from "api/apps/curations/model.coffee"
import Display from "api/apps/graphql/schemas/display.js"
import * as resolvers from "api/apps/graphql/resolvers.js"
import Tag from "api/apps/tags/model.coffee"
import { setUser } from "api/apps/users/routes.coffee"

const app = (module.exports = express())

const metaFields = {
  is_super_sub_article: boolean().meta({
    resolve: async root => (await getSuperArticleCount(root.id)) > 0,
  }),
  relatedArticlesCanvas: array()
    .items(
      object(Article.inputSchema).concat(
        object({
          authors: array()
            .items(object(Author.schema))
            .meta({
              resolve: resolvers.relatedAuthors,
            }),
        })
      )
    )
    .meta({
      name: "RelatedArticlesCanvas",
      resolve: resolvers.relatedArticlesCanvas,
    }),
  relatedArticlesPanel: array()
    .items(object(Article.inputSchema))
    .meta({
      name: "RelatedArticlesPanel",
      resolve: resolvers.relatedArticlesPanel,
    }),
  relatedArticles: array()
    .items(object(Article.inputSchema))
    .meta({
      name: "RelatedArticles",
      resolve: resolvers.relatedArticles,
    }),
  display: Display.schema.meta({
    args: Display.querySchema,
    resolve: resolvers.display,
  }),
  authors: array()
    .items(object(Author.schema))
    .meta({
      resolve: resolvers.relatedAuthors,
    }),
  seriesArticle: object(Article.inputSchema).meta({
    name: "SeriesArticle",
    resolve: resolvers.seriesArticle,
  }),
}

const ArticleSchema = object(Article.inputSchema).concat(object(metaFields))

const schema = joiql({
  query: {
    articles: array()
      .items(ArticleSchema)
      .meta({
        args: Article.querySchema,
        resolve: resolvers.articles,
      }),
    article: ArticleSchema.meta({
      args: { id: string() },
      resolve: resolvers.article,
    }),
    authors: array()
      .items(object(Author.schema))
      .meta({
        args: Author.querySchema,
        resolve: resolvers.authors,
      }),
    curations: array()
      .items(object(Curation.schema))
      .meta({
        args: Curation.querySchema,
        resolve: resolvers.curations,
      }),
    channels: array()
      .items(object(Channel.schema))
      .meta({
        args: Channel.querySchema,
        resolve: resolvers.channels,
      }),
    display: Display.schema.meta({
      args: Display.querySchema,
      resolve: resolvers.display,
    }),
    tags: array()
      .items(object(Tag.schema))
      .meta({
        args: Tag.querySchema,
        resolve: resolvers.tags,
      }),
  },
})

app.use(
  "/graphql",
  setUser,
  graphqlHTTP({
    schema,
    graphiql: true,
    formatError: error => {
      return {
        message: error.message,
        locations: error.locations,
        stack: error.stack,
      }
    },
  })
)
