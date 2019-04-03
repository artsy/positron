import { Serif } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import React from "react"
import ArticleListItem from "./article_list_item"

interface ArticleListProps {
  articles: ArticleData[]
  checkable: boolean
  display: string
  isLoading: boolean
  selected: (article: ArticleData) => void
}

export const ArticleList: React.SFC<ArticleListProps> = props => {
  const { articles, isLoading } = props

  return (
    <div>
      {!articles.length && !isLoading ? (
        <Serif size="5" pt={4}>
          No Results Found
        </Serif>
      ) : (
        articles.map((article, i) => {
          return <ArticleListItem key={i} article={article} {...props} />
        })
      )}
    </div>
  )
}
