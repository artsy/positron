import { Box, color as Color, Sans } from "@artsy/palette"
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
      <Box pb={6} position="relative">
        <Sans size="3" weight="medium">
          <EditLink
            className="EditArticleCard__edit"
            href={`/articles/${article.id}/edit`}
            target="_blank"
            color={color}
          >
            Edit Article
          </EditLink>
        </Sans>

        <RemoveButton
          position="absolute"
          width={30}
          onClick={() => onRemoveArticle(article.id)}
        >
          <IconRemove
            background={color && color}
            color={color === "white" ? "black" : "white"}
          />
        </RemoveButton>

        <ArticleCard article={article} series={series} color={color} />
      </Box>
    )
  }
}

const EditLink = styled.a`
  color: ${props => props.color || "black"};
  position: absolute;
  right: 35px;
  top: 4px;

  &:hover {
    opacity: 0.65;
  }
`

export const RemoveButton = styled(Box)`
  right: -10px;
  top: -10px;
  cursor: pointer;

  &:hover {
    circle {
      fill: ${Color("red100")};
    }
  }
`
