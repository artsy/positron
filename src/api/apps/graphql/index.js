import express from "express"
import graphqlHTTP from "express-graphql"
import joiql from "joiql"
import { object, array, string, boolean } from "joi"
import { getSuperArticleCount } from "api/apps/articles/model"
import Article from "api/apps/articles/model/schema.coffee"
import Author from "api/apps/authors/model.coffee"
import Channel from "api/apps/channels/model.coffee"
import Curation from "api/apps/curations/model.coffee"
import * as resolvers from "api/apps/graphql/resolvers.js"
import Tag from "api/apps/tags/model.coffee"
import { setUser } from "api/apps/users/routes.coffee"

const app = (module.exports = express())

const metaFields = {
  authors: array()
    .items(object(Author.schema))
    .meta({
      resolve: resolvers.relatedAuthors,
    }),
  channel: object(Channel.schema).meta({
    name: "Channel",
    resolve: resolvers.articleChannel,
  }),
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
    .items(
      object(Article.inputSchema)
        .concat(
          object({
            authors: array()
              .items(object(Author.schema))
              .meta({
                resolve: resolvers.relatedAuthors,
              }),
          })
        )
        .concat(
          object({
            seriesArticle: object(Article.inputSchema).meta({
              resolve: resolvers.seriesArticle,
            }),
          })
        )
        .concat(
          object({
            relatedArticles: array()
              .items(
                object(Article.inputSchema)
                  .concat(
                    object({
                      authors: array()
                        .items(object(Author.schema))
                        .meta({
                          resolve: resolvers.relatedAuthors,
                        }),
                    })
                  )
                  .concat(
                    object({
                      seriesArticle: object(Article.inputSchema).meta({
                        resolve: resolvers.seriesArticle,
                      }),
                    })
                  )
              )
              .meta({
                resolve: resolvers.relatedArticles,
              }),
          })
        )
    )
    .meta({
      name: "RelatedArticles",
      resolve: resolvers.relatedArticles,
    }),
  seriesArticle: object(Article.inputSchema).meta({
    name: "SeriesArticle",
    resolve: resolvers.seriesArticle,
  }),
}

const ArticleSchema = object(Article.inputSchema).concat(object(metaFields))

export const schema = joiql({
  query: {
    articles: array()
      .items(ArticleSchema)
      .meta({
        typeName: "Articles",
        args: Article.querySchema,
        resolve: resolvers.articles,
      }),
    article: ArticleSchema.meta({
      typeName: "Article",
      args: { id: string() },
      resolve: resolvers.article,
    }),
    authors: array()
      .items(object(Author.schema))
      .meta({
        typeName: "Authors",
        args: Author.querySchema,
        resolve: resolvers.authors,
      }),
    curations: array()
      .items(object(Curation.schema))
      .meta({
        typeName: "Curations",
        args: Curation.querySchema,
        resolve: resolvers.curations,
      }),
    channels: array()
      .items(object(Channel.schema))
      .meta({
        typeName: "Channels",
        args: Channel.querySchema,
        resolve: resolvers.channels,
      }),
    tags: array()
      .items(object(Tag.schema))
      .meta({
        typeName: "Tags",
        args: Tag.querySchema,
        resolve: resolvers.tags,
      }),
  },
})

module.exports.schema = schema

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
