import { color as Color, Flex } from "@artsy/palette"
import { ArticleCard } from "@artsy/reaction/dist/Components/Publishing/RelatedArticles/ArticleCards/ArticleCard"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { RelatedArticleQuery } from "client/queries/related_articles"
import { difference, flatten, get, map, uniq, without } from "lodash"
import React, { Component } from "react"
import { data as sd } from "sharify"
import styled from "styled-components"
import request from "superagent"
import { EditArticleCard } from "./components/edit_article_card"
import { RelatedArticlesInput } from "./components/related_articles_input"
const DraggableList = require("client/components/drag_drop/index.coffee")

export interface RelatedArticlesProps {
  article: ArticleData
  color?: string
  onChange: (key: any, val: any) => void
}

interface RelatedArticlesState {
  relatedArticles: any[]
  loading: boolean
}

export class RelatedArticles extends Component<
  RelatedArticlesProps,
  RelatedArticlesState
> {
  state = {
    relatedArticles: [] as any[],
    loading: true,
  }

  componentWillMount = () => {
    this.fetchArticles()
  }

  fetchArticles = () => {
    const { related_article_ids } = this.props.article
    const { relatedArticles } = this.state
    const alreadyFetched = map(relatedArticles, "id")
    const idsToFetch = difference(related_article_ids, alreadyFetched)

    if (idsToFetch.length) {
      request
        .get(`${sd.API_URL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": sd.USER && sd.USER.access_token,
        })
        .query({ query: RelatedArticleQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          const articles = res && get(res, "body.data.articles")

          if (articles) {
            relatedArticles.push(articles)
          }
          this.setState({
            loading: false,
            relatedArticles: uniq(flatten(relatedArticles)),
          })
        })
    } else {
      this.setState({
        loading: false,
        relatedArticles,
      })
    }
  }

  onAddArticle = related_article_ids => {
    const { onChange } = this.props

    onChange("related_article_ids", related_article_ids)
    this.fetchArticles()
  }

  onRemoveArticle = (id, index) => {
    const { article, onChange } = this.props
    const { relatedArticles } = this.state
    const { related_article_ids } = article
    const newRelatedIds = without(related_article_ids, id)

    relatedArticles.splice(index, 1)
    onChange("related_article_ids", newRelatedIds)
    this.setState({ relatedArticles })
  }

  onDragEnd = relatedArticles => {
    const { onChange } = this.props
    const newRelatedIds = map(relatedArticles, "id")

    this.setState({ relatedArticles })
    onChange("related_article_ids", newRelatedIds)
  }

  renderRelatedArticles = () => {
    const { article, color } = this.props
    const { relatedArticles } = this.state

    return (
      <DraggableList
        items={relatedArticles}
        onDragEnd={this.onDragEnd}
        layout="vertical"
        isDraggable
      >
        {relatedArticles.map((relatedArticle, i) => (
          <EditArticleCard
            key={i}
            article={relatedArticle}
            series={article.attributes}
            onRemoveArticle={id => this.onRemoveArticle(id, i)}
            color={color}
          />
        ))}
      </DraggableList>
    )
  }

  renderRelatedPreview = () => {
    const { article, color } = this.props

    return (
      <RelatedArticlePreview>
        <ArticleCard
          editTitle="Title"
          editDescription="Article or video description..."
          editImage={<div />}
          editDate={!article.published && "Publish Date"}
          article={{}}
          series={article}
          color={color}
        />
      </RelatedArticlePreview>
    )
  }

  render() {
    const { relatedArticles, loading } = this.state
    const { article, color } = this.props

    return (
      <Flex flexDirection="column">
        <div>
          {loading ? (
            <div className="loading-spinner" />
          ) : relatedArticles.length ? (
            this.renderRelatedArticles()
          ) : (
            this.renderRelatedPreview()
          )}
        </div>

        <RelatedArticlesInput
          article={article}
          color={color}
          onChange={this.onAddArticle}
        />
      </Flex>
    )
  }
}

const RelatedArticlePreview = styled.div`
  div[class^="ArticleCard__ImageContainer"] {
    min-height: 300px;
    background: ${Color("black30")};
  }
  a {
    cursor: default;
  }
`
