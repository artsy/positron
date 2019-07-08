import { IconRemove } from "@artsy/reaction/dist/Components/Publishing/Icon/IconRemove"
import { ArticleCard } from "@artsy/reaction/dist/Components/Publishing/RelatedArticles/ArticleCards/ArticleCard"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React, { Component } from "react"
import styled from "styled-components"

interface EditArticleCardProps {
  article: ArticleData
  color?: string
  series: any
  onRemoveArticle: (id: string) => void
}

export class EditArticleCard extends Component<EditArticleCardProps> {
  render() {
    const { article, color, series, onRemoveArticle } = this.props

    return (
      <div className="EditArticleCard">
        <EditLink
          className="EditArticleCard__edit"
          href={`/articles/${article.id}/edit`}
          target="_blank"
          color={color}
        >
          Edit Article
        </EditLink>

        <div
          className="EditArticleCard__remove"
          onClick={() => onRemoveArticle(article.id)}
        >
          <IconRemove
            background={color && color}
            color={color === "white" ? "black" : "white"}
          />
        </div>

        <ArticleCard article={article} series={series} color={color} />
      </div>
    )
  }
}

const EditLink = styled.a`
  color: ${props => props.color || "black"};
`
